var sPanel = null;
var mPanel = null;
var rPanel = null;
var pGrid = null;

var borders = { Top: "Top", Right: "Right", Bottom: "Bottom", Left: "Left" };
var dimensionTypes = { Height: "Height", Width: "Width", Top: "Top", Right: "Right", Bottom: "Bottom", Left: "Left", Y: "Y", X: "X" };

var _resizePanel = function (grid, panel, border) {
    this.Grid = grid;
    this.Panel = panel;
    this.Border = border;
    this.Dimensions = function () {
        return this.Panel.getBoundingClientRect();
    }
    this.ColumnSpan = function () {
        return Math.min(this.Grid.Columns(), Math.max(1, Math.round(this.Dimensions().width / this.Grid.ColumnWidth())));
    }
    this.ColumnOffset = function () {
        var result = parseInt(this.ColumnSpan() - 1);
        return result;
    }
    this.RowSpan = function () {
        return Math.min(this.Grid.Rows(), Math.max(1, Math.round(this.Dimensions().height / this.Grid.RowHeight())));
    }
    this.RowOffset = function () {
        var result = parseInt(this.RowSpan() - 1);
        return result;
    }
}

var _pGrid = function () {
    this.Grid = document.getElementsByClassName('PanelGrid')[0];
    this.Dimensions = this.Grid.getBoundingClientRect();
    this.Columns = function () {
        var result = parseInt(this.Grid.classList[1].split('-')[0].split('')[1]);
        return result;
    }
    this.ColumnGaps = parseInt(this.Columns() - 1);
    this.ColumnWidth = function () {
        var result = parseInt((this.Dimensions.width / this.Columns()) - (((this.ColumnGaps / this.Columns()) * 2) * parseFloat(getComputedStyle(document.documentElement).fontSize)));
        return result;
    }
    this.MaxColumn = parseInt(this.Columns() + 1);
    this.Rows = function () {
        var result = parseInt(this.Grid.classList[1].split('-')[1].split('')[1]);
        return result;
    }
    this.RowGaps = parseInt(this.Rows() - 1);
    this.RowHeight = function () {
        var result = parseInt((this.Dimensions.height / this.Rows()) - (((this.RowGaps / this.Rows()) * 2) * parseFloat(getComputedStyle(document.documentElement).fontSize)));
        return result;
    }
    this.MaxRow = parseInt(this.Rows() + 1);
}

$(document).ready(function () {
    pGrid = new _pGrid();

    $(document.body).on("mousemove", function (e) {
        if (mPanel) {
            PauseMouseEvents(e);
            mPanel.style.top = e.clientY + 'px';
            mPanel.style.left = e.clientX + 'px';
        }
        if (rPanel) {
            PauseMouseEvents(e);
            switch (rPanel.Border) {
                case borders.Top:
                    rPanel.Panel.style.height = Math.max(pGrid.RowHeight(), rPanel.Dimensions().height + (rPanel.Dimensions().top - e.clientY)) + 'px'; //Done
                    break;
                case borders.Right:
                    rPanel.Panel.style.width = Math.max(pGrid.ColumnWidth(), rPanel.Dimensions().width + (e.clientX - rPanel.Dimensions().right)) + 'px';
                    break;
                case borders.Bottom:
                    rPanel.Panel.style.height = Math.max(pGrid.RowHeight(), (rPanel.Dimensions().height + (e.clientY - rPanel.Dimensions().bottom) + 1)) + 'px'; //Add 1 to ensure the cursor is still over the border to trigger the hover effect
                    break;
                case borders.Left:
                    rPanel.Panel.style.width = Math.max(pGrid.ColumnWidth(), rPanel.Dimensions().width + (rPanel.Dimensions().left - e.clientX)) + 'px';
                    break;
            }
        }
    });


    $(document.body).on("mousedown", "img", function (e) {
        try {
            if (e.target.parentElement.classList.contains('Move')) {
                mPanel = e.target.parentElement.parentElement.parentElement.parentElement;
                if (mPanel.parentElement.classList.contains('Static')) {
                    mPanel = null;
                }
                else {
                    mPanel.style.top = e.clientY + 'px';
                    mPanel.style.left = e.clientX + 'px';
                    // prevents weird overflow when the control is no longer bound by the size of the grid
                    mPanel.style.maxHeight = '4rem';
                    mPanel.style.maxWidth = '4rem';
                    mPanel.classList.add('Moving');
                }
            }
        } catch (e) {

        }
    });

    $(document.body).on("mousedown", ".Border", function (e) {
        try {
            if (e.target.parentElement.classList.contains('Static')) {
                rPanel = null;
            }
            else {
                rPanel = new _resizePanel(pGrid, e.target.parentElement);
                var border = e.target;

                rPanel.Panel.style.width = rPanel.Dimensions().width + 'px';
                rPanel.Panel.style.height = rPanel.Dimensions().height + 'px';

                switch (border.classList[1]) {
                    case borders.Top:
                        rPanel.Border = borders.Top;
                        rPanel.Panel.style.bottom = (window.innerHeight - rPanel.Dimensions().bottom) + 'px';
                        rPanel.Panel.style.left = rPanel.Dimensions().left + 'px';
                        break;
                    case borders.Right:
                        rPanel.Border = borders.Right;
                        rPanel.Panel.style.left = rPanel.Dimensions().left + 'px';
                        rPanel.Panel.style.top = rPanel.Dimensions().top + 'px';
                        break;
                    case borders.Bottom:
                        rPanel.Border = borders.Bottom;
                        rPanel.Panel.style.left = rPanel.Dimensions().left + 'px';
                        rPanel.Panel.style.top = rPanel.Dimensions().top + 'px';
                        break;
                    case borders.Left:
                        rPanel.Border = borders.Left;
                        rPanel.Panel.style.right = (window.innerWidth - rPanel.Dimensions().right) + 'px';
                        rPanel.Panel.style.top = rPanel.Dimensions().top + 'px';
                        break;
                }

                rPanel.Panel.classList.add('Resizing');
            }
        } catch (e) {

        }
    });

    $(document.body).on("mouseup", function (e) {
        if (mPanel != null) {
            mPanel.style.top = null;
            mPanel.style.left = null;
            mPanel.style.maxHeight = null;
            mPanel.style.maxWidth = null;
            mPanel.classList.remove('Moving');

            SwitchPanelPosition();
        }

        if (rPanel != null) {
            UpdatePanelDimensions();
            rPanel.Panel.classList.remove('Resizing');
            rPanel.Panel.style.top = null;
            rPanel.Panel.style.right = null;
            rPanel.Panel.style.bottom = null;
            rPanel.Panel.style.left = null;
            rPanel.Panel.style.height = null;
            rPanel.Panel.style.width = null;

            ClearPanel();
        }
    });
});

function ClearmPanel() {
    mPanel = null;
}

function ClearPanel() {
    rPanel = null;
}

function SelectPanel(id) {
    var panel = document.getElementById(id);
    if (panel.classList.contains("GPanel") && !panel.classList.contains('Static')) {
        sPanel = panel;
    }
}

function SwitchPanelPosition() {
    if (sPanel != null) {
        var newGridPos = GetGridPositions(sPanel);
        var oldGridPos = GetGridPositions(mPanel.parentElement);

        mPanel.parentElement.setAttribute('col', newGridPos[0]);
        mPanel.parentElement.setAttribute('row', newGridPos[1]);
        sPanel.setAttribute('col', oldGridPos[0]);
        sPanel.setAttribute('row', oldGridPos[1]);

        ClearmPanel();
    }
}

function GetGridPositions(panel) {
    var gridPos = [];
    gridPos[0] = panel.getAttribute('col');
    gridPos[1] = panel.getAttribute('row');

    return gridPos;
}

function GetPanelColumns(panel) {
    var panelCols = [];

    panelCols[0] = parseInt(panel.getAttribute('col').split('-')[0]);
    panelCols[1] = parseInt(panel.getAttribute('col').split('-')[1]);

    return panelCols;
}

function GetPanelRows(panel) {
    var panelRows = [];

    panelRows[0] = parseInt(panel.getAttribute('row').split('-')[0]);
    panelRows[1] = parseInt(panel.getAttribute('row').split('-')[1]);

    return panelRows;
}

function ToggleStatic(btn) {
    var panel = btn.parentElement.parentElement.parentElement.parentElement;
    panel.classList.toggle('Static');
}

function ClosePanel(btn) {
    var panel = btn.parentElement.parentElement.parentElement.parentElement;
    panel.remove();
}

function MinimizePanel(btn) {
    //TODO
}

function PauseMouseEvents(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
}

function UpdatePanelDimensions() {
    if (rPanel.Panel) {
        var panelCols = GetPanelColumns(rPanel.Panel);
        var panelRows = GetPanelRows(rPanel.Panel);
        var newCols = [];
        var newRows = [];

        switch (rPanel.Border) {
            case borders.Top:
                newCols = panelCols;
                newRows[0] = Math.max(1, panelRows[1] - rPanel.RowOffset());
                newRows[1] = panelRows[1];
                break;
            case borders.Right:
                newRows = panelRows;
                newCols[0] = panelCols[0];
                newCols[1] = Math.min(pGrid.Columns(), (panelCols[0] + rPanel.ColumnOffset()));
                break;
            case borders.Bottom:
                newCols = panelCols;
                newRows[0] = panelRows[0];
                newRows[1] = Math.min(pGrid.Rows(), (panelRows[0] + rPanel.RowOffset()));
                break;
            case borders.Left:
                newRows = panelRows;
                newCols[0] = Math.max(1, panelCols[1] - rPanel.ColumnOffset());
                newCols[1] = panelCols[1];
                break;
        }

        if (CheckGridConflicts(newCols, newRows)) {
            rPanel.Panel.setAttribute('col', newCols.join('-'));
            rPanel.Panel.setAttribute('row', newRows.join('-'));
        }
    }
}

function CheckGridConflicts(newCols, newRows) {
    var panels = document.getElementsByClassName('GPanel');
    var newPosition = [GetArrayExtent(newCols), GetArrayExtent(newRows)];
    var panelPositions = [];

    if (panels != null && panels != undefined) {
        for (var i = 0; i < panels.length; i++) {
            if (panels[i] != rPanel.Panel) {
                panelPositions.push([GetArrayExtent(GetPanelColumns(panels[i])), GetArrayExtent(GetPanelRows(panels[i]))]);
            }
        }
    }

    for (var i = 0; i < panelPositions.length; i++) {
        for (var c = 0; c < panelPositions[i][0].length; c++) {
            for (var r = 0; r < panelPositions[i][1].length; r++) {
                var testCol = panelPositions[i][0][c];
                var testRow = panelPositions[i][1][r];
                if ((newPosition[0].indexOf(testCol) > -1) && (newPosition[1].indexOf(testRow) > -1)) {
                    return false;
                }
            }
        }
    }

    return true;
}

function GetArrayExtent(array) {
    var result = [];
    if (array != undefined && array != null && array.length > 0) {
        for (var i = array[0]; i <= array[1]; i++) {
            result.push(i);
        }
    }

    return result;
}
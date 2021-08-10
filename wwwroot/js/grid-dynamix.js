var sPanel = null;
var mPanel = null;
var rPanel = null;
var Grid = null;

var borders = { Top: "Top", Right: "Right", Bottom: "Bottom", Left: "Left" };
var dimensionTypes = { Height: "Height", Width: "Width", Top: "Top", Right: "Right", Bottom: "Bottom", Left: "Left", Y: "Y", X: "X" };

var _grid = function () {
    this.Element = document.getElementsByClassName('Panel-Grid')[0];
    this._Panels = [];
    this.Dimensions = function () {
        return this.Element.getBoundingClientRect();
    }
    this.Columns = function () {
        var result = parseInt(this.Element.classList[1].split('-')[0].split('')[1]);
        return result;
    }
    this.ColumnGaps = parseInt(this.Columns() - 1);
    this.ColumnWidth = function () {
        var result = parseInt((this.Dimensions().width / this.Columns()) - (((this.ColumnGaps / this.Columns()) * 2) * parseFloat(getComputedStyle(document.documentElement).fontSize)));
        return result;
    }
    this.MaxColumn = parseInt(this.Columns() + 1);
    this.Rows = function () {
        var result = parseInt(this.Element.classList[1].split('-')[1].split('')[1]);
        return result;
    }
    this.RowGaps = parseInt(this.Rows() - 1);
    this.RowHeight = function () {
        var result = parseInt((this.Dimensions().height / this.Rows()) - (((this.RowGaps / this.Rows()) * 2) * parseFloat(getComputedStyle(document.documentElement).fontSize)));
        return result;
    }
    this.MaxRow = parseInt(this.Rows() + 1);
    this.Panels = function () {
        if (this._Panels.length == 0) {
            for (var i = 0; i < this.Element.children.length; i++) {
                this._Panels.push(new _panel(this.Element, this.Element.children[i]))
            }
        }

        return this._Panels;
    }
    this.RefreshPanels = function () {
        for (var i = 0; i < this.Element.children; i++) {
            this._Panels.push(new _panel(this.Element, this.Element.children[i]))
        }
    }
    this.Map = function () {
        var map = new Array();

        for (var r = 0; r < this.Rows(); r++) {
            for (var c = 0; c < this.Columns(); c++) {
                map.push(new Array(r, c, 0));
            }
        }

        for (var p = 0; p < this.Panels().length; p++) {
            var panel = this.Panels()[p];
            var firstRow = panel.FirstRow();
            var lastRow = panel.LastRow();
            var firstColumn = panel.FirstColumn();
            var lastColumn = panel.LastColumn();
            for (var r = firstRow - 1; r < lastRow; r++) {
                for (var c = firstColumn - 1; c < lastColumn; c++) {
                    for (var m = 0; m < map.length; m++) {
                        var entry = map[m];
                        if (entry[0] == r && entry[1] == c) {
                            entry[2] = 1;
                            break;
                        }
                    }
                }
            }
        }

        return map;
    }
    this.PrintMap = function () {
        //var map = this.Map();
        //var mapString = '';

        //for (var r = 0; r < this.Rows(); r++) {
        //    for (var c = 0; c < this.Columns(); c++) {
        //        for (var m = 0; m < map.length; m++) {
        //            var entry = map[m];
        //            if (entry[0] == r && entry[1] == c) {
        //                mapString += '[' + (entry[2] == 1 ? '+' : '_') + ']';
        //                if (c == this.Columns() - 1) {
        //                    mapString += '\r\n';
        //                }
        //            }
        //        }
        //    }
        //}

        var model = new _gridModel(this.Map(), this.Rows(), this.Columns());

        return model.Instantiate();
    }
}

var _panel = function (grid, element, border) {
    this.Grid = grid;
    this.Element = element;
    this.ActiveBorder = border;
    this.Dimensions = function () {
        return this.Element.getBoundingClientRect();
    }
    this.Columns = function () {
        return this.Element.getAttribute('col').split('-');
    }
    this.FirstColumn = function () {
        return parseInt(this.Columns()[0]);
    }
    this.LastColumn = function () {
        return parseInt(this.Columns()[1]);
    }
    this.ColumnSpan = function () {
        return Math.min(this.Grid.Columns(), Math.max(1, Math.round(this.Dimensions().width / this.Grid.ColumnWidth())));
    }
    this.ColumnOffset = function () {
        var result = parseInt(this.ColumnSpan() - 1);
        return result;
    }
    this.Rows = function () {
        return this.Element.getAttribute('row').split('-');
    }
    this.FirstRow = function () {
        return parseInt(this.Rows()[0]);
    }
    this.LastRow = function () {
        return parseInt(this.Rows()[1]);
    }
    this.RowSpan = function () {
        return Math.min(this.Grid.Rows(), Math.max(1, Math.round(this.Dimensions().height / this.Grid.RowHeight())));
    }
    this.RowOffset = function () {
        var result = parseInt(this.RowSpan() - 1);
        return result;
    }
    this.SetActiveBorder = function (border) {
        this.ActiveBorder = border;
    }
}

var _gridModel = function (map, rows, cols) {
    this._Map = map;
    this._Rows = rows;
    this._Columns = cols;
    this._Model = '<div class="grid-model">{0}</div>';
    this._Row = '<div class="row">{0}</div>';
    this._Cube = function (populated) {
        return '<div class="cube' + (populated ? ' pupulated' : '') + '"></div>';
    }
    this.Instantiate = function () {
        var rows = '';

        for (var r = 0; r < this._Rows; r++) {
            rows += this._Row;
            var cubes = '';
            for (var c = 0; c < this._Columns; c++) {
                for (var m = 0; m < map.length; m++) {
                    var entry = map[m];
                    if (entry[0] == r && entry[1] == c) {
                        cubes += this._Cube(entry[2] == 1);
                    }
                }
            }
            rows.replace('{0}', cubes);
            cubes = '';
        }

        return this._Model.replace('{0}', rows);
    }
}

$(document).ready(function () {
    Grid = new _grid();
    document.getElementById('Grid_Model').innerHTML = Grid.PrintMap();

    $(document.body).on("pointermove", function (e) {
        if (mPanel) {
            PauseMouseEvents(e);
            mPanel.style.top = e.clientY + 'px';
            mPanel.style.left = e.clientX + 'px';
        }
        if (rPanel) {
            PauseMouseEvents(e);
            switch (rPanel.ActiveBorder) {
                case borders.Top:
                    rPanel.Element.style.height = Math.max(Grid.RowHeight(), rPanel.Dimensions().height + (rPanel.Dimensions().top - e.clientY)) + 'px'; //Done
                    break;
                case borders.Right:
                    rPanel.Element.style.width = Math.max(Grid.ColumnWidth(), rPanel.Dimensions().width + (e.clientX - rPanel.Dimensions().right)) + 'px';
                    break;
                case borders.Bottom:
                    rPanel.Element.style.height = Math.max(Grid.RowHeight(), (rPanel.Dimensions().height + (e.clientY - rPanel.Dimensions().bottom) + 1)) + 'px'; //Add 1 to ensure the cursor is still over the border to trigger the hover effect
                    break;
                case borders.Left:
                    rPanel.Element.style.width = Math.max(Grid.ColumnWidth(), rPanel.Dimensions().width + (rPanel.Dimensions().left - e.clientX)) + 'px';
                    break;
            }
        }
    });


    $(document.body).on("pointerdown", "img", function (e) {
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

    $(document.body).on("pointerdown", ".Border", function (e) {
        try {
            if (e.target.parentElement.classList.contains('Static')) {
                rPanel = null;
            }
            else {
                rPanel = new _panel(Grid, e.target.parentElement);
                var border = e.target;

                rPanel.Element.style.width = rPanel.Dimensions().width + 'px';
                rPanel.Element.style.height = rPanel.Dimensions().height + 'px';

                switch (border.classList[1]) {
                    case borders.Top:
                        rPanel.ActiveBorder = borders.Top;
                        rPanel.Element.style.bottom = (window.innerHeight - rPanel.Dimensions().bottom) + 'px';
                        rPanel.Element.style.left = rPanel.Dimensions().left + 'px';
                        break;
                    case borders.Right:
                        rPanel.ActiveBorder = borders.Right;
                        rPanel.Element.style.left = rPanel.Dimensions().left + 'px';
                        rPanel.Element.style.top = rPanel.Dimensions().top + 'px';
                        break;
                    case borders.Bottom:
                        rPanel.ActiveBorder = borders.Bottom;
                        rPanel.Element.style.left = rPanel.Dimensions().left + 'px';
                        rPanel.Element.style.top = rPanel.Dimensions().top + 'px';
                        break;
                    case borders.Left:
                        rPanel.ActiveBorder = borders.Left;
                        rPanel.Element.style.right = (window.innerWidth - rPanel.Dimensions().right) + 'px';
                        rPanel.Element.style.top = rPanel.Dimensions().top + 'px';
                        break;
                }

                rPanel.Element.classList.add('Resizing');
            }
        } catch (e) {

        }
    });

    $(document.body).on("pointerup", function (e) {
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
            rPanel.Element.classList.remove('Resizing');
            rPanel.Element.style.top = null;
            rPanel.Element.style.right = null;
            rPanel.Element.style.bottom = null;
            rPanel.Element.style.left = null;
            rPanel.Element.style.height = null;
            rPanel.Element.style.width = null;

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
    if (rPanel.Element) {
        var panelCols = GetPanelColumns(rPanel.Element);
        var panelRows = GetPanelRows(rPanel.Element);
        var newCols = [];
        var newRows = [];

        switch (rPanel.ActiveBorder) {
            case borders.Top:
                newCols = panelCols;
                newRows[0] = Math.max(1, panelRows[1] - rPanel.RowOffset());
                newRows[1] = panelRows[1];
                break;
            case borders.Right:
                newRows = panelRows;
                newCols[0] = panelCols[0];
                newCols[1] = Math.min(Grid.Columns(), (panelCols[0] + rPanel.ColumnOffset()));
                break;
            case borders.Bottom:
                newCols = panelCols;
                newRows[0] = panelRows[0];
                newRows[1] = Math.min(Grid.Rows(), (panelRows[0] + rPanel.RowOffset()));
                break;
            case borders.Left:
                newRows = panelRows;
                newCols[0] = Math.max(1, panelCols[1] - rPanel.ColumnOffset());
                newCols[1] = panelCols[1];
                break;
        }

        if (CheckGridConflicts(newCols, newRows)) {
            rPanel.Element.setAttribute('col', newCols.join('-'));
            rPanel.Element.setAttribute('row', newRows.join('-'));
        }
    }
}

function CheckGridConflicts(newCols, newRows) {
    var panels = document.getElementsByClassName('GPanel');
    var newPosition = [GetArrayExtent(newCols), GetArrayExtent(newRows)];
    var panelPositions = [];

    if (panels != null && panels != undefined) {
        for (var i = 0; i < panels.length; i++) {
            if (panels[i] != rPanel.Element) {
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

function UpdateGridDimensions(axis, value) {
    switch (axis) {
        case 'col':
            CheckUtilizedColumns(value);
            break;
        case 'row':
            CheckUtilizedRows(value);
            break;
    }
}

function CheckUtilizedColumns(value) {

}

function CheckUtilizedRows() {

}
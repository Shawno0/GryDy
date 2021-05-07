var activePanel = null;
var selectedPanel = null;

$(document).ready(function () {
    var gpanel = null;

    $(document.body).on("mousemove", function (e) {
        if (gpanel) {
            PauseMouseEvents(e);
            gpanel.style.top = e.clientY + 'px';
            gpanel.style.left = e.clientX + 'px';
        }
    });


    $(document.body).on("mousedown", "img", function (e) {
        try {
            if (e.target.parentElement.classList.contains('Move')) {
                gpanel = e.target.parentElement.parentElement.parentElement.parentElement;
                gpanel.style.top = e.clientY + 'px';
                gpanel.style.left = e.clientX + 'px';
                gpanel.classList.add('Moving');
            }
        } catch (e) {

        }
    });

    $(document.body).on("mouseup", function (e) {
        if (gpanel != null) {
            gpanel.classList.remove('Moving');
            gpanel.style.top = null;
            gpanel.style.left = null;

            UpdatePanelPosition(gpanel.parentElement);
        }
        gpanel = null;
    });
});

function SelectPanel(id) {
    var panel = document.getElementById(id);
    if (panel.classList.contains("GPanel") && !panel.classList.contains('Static')) {
        selectedPanel = panel;
    }
}

function UpdatePanelPosition(panel) {
    if (selectedPanel != null) {
        var newGridPos = GetGridPositions(selectedPanel.classList);
        var oldGridPos = GetGridPositions(panel.classList);

        panel.className = 'GPanel ' + newGridPos;
        selectedPanel.className = 'GPanel ' + oldGridPos;
    }
}

function GetGridPositions(cList) {
    var gridPos = '';
    if (cList.length != undefined && cList.length > 1) {
        for (var i = 0; i < cList.length; i++) {
            if (cList[i] != 'GPanel') {
                if (gridPos.length == 0) {
                    gridPos += cList[i];
                }
                else {
                    gridPos += ' ' + cList[i];
                }
            }
        }
    }

    return gridPos;
}

function PauseMouseEvents(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
}
/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations under the License.
 */

function populateAnalyticsTable(analyticsTable, columnInformation, action, type) {
    var tbody = analyticsTable.getElementsByTagName('tbody')[0];
    for (var i = 1; i < columnInformation.rows.length; i++) {
        var cellNo = 0;
        var meta = columnInformation.rows[i];
        var column0 = meta.cells[0].textContent.trim();
        var column1 = meta.cells[1].textContent.trim();
        var row = tbody.insertRow(analyticsTable.rows.length - 1);

        var persistCell = row.insertCell(cellNo++);
        var persistCheckElement = document.createElement('input');
        persistCheckElement.type = "checkbox";
        persistCheckElement.name = "persist";
        if (action == 'add') {
            persistCheckElement.checked = true;
        }
        persistCell.appendChild(persistCheckElement);

        var columnCell = row.insertCell(cellNo++);
        var columnInputElement = document.createElement('label');
        columnInputElement.name = "column";
        columnInputElement.innerHTML = type + column0;
        columnCell.appendChild(columnInputElement);

        var typeCell = row.insertCell(cellNo++);
        var selectElement = document.createElement('select');

        if (column1 == 'string') {
            selectElement.options[0] = new Option('STRING', 'string');
            selectElement.options[1] = new Option('FACET', 'FACET');
        } else {
            selectElement.options[0] = new Option('STRING', 'string');
            selectElement.options[1] = new Option('INTEGER', 'int');
            selectElement.options[2] = new Option('LONG', 'long');
            selectElement.options[3] = new Option('BOOLEAN', 'bool');
            selectElement.options[4] = new Option('FLOAT', 'float');
            selectElement.options[5] = new Option('DOUBLE', 'double');
            selectElement.options[6] = new Option('FACET', 'FACET');
            selectElement.disabled = true;
        }
        selectElement.value = column1;
        typeCell.appendChild(selectElement);

        var primaryCell = row.insertCell(cellNo++);
        var primaryCheckElement = document.createElement('input');
        primaryCheckElement.type = "checkbox";
        primaryCell.appendChild(primaryCheckElement);

        var indexCell = row.insertCell(cellNo++);
        var indexCheckElement = document.createElement('input');
        indexCheckElement.type = "checkbox";
        indexCell.appendChild(indexCheckElement);

        var scoreParamCell = row.insertCell(cellNo++);
        var scoreParamCheckElement = document.createElement('input');
        scoreParamCheckElement.type = "checkbox";
        if (column1 == 'string' || column1 == 'bool') {
            scoreParamCheckElement.disabled = true;
        }
        scoreParamCell.appendChild(scoreParamCheckElement);
    }
}

function createAnalyticsIndexTable(action) {
    var table = document.getElementById('analyticsIndexTable');
    for (var i = table.rows.length; i > 1; i--) {
        table.deleteRow(i - 1);
    }
    var metaDataTable = document.getElementById("outputMetaDataTable");
    if (metaDataTable.rows.length > 1) {
        populateAnalyticsTable(table, metaDataTable, action, 'meta_');
    }
    var correlationDataTable = document.getElementById("outputCorrelationDataTable");
    if (correlationDataTable.rows.length > 1) {
        populateAnalyticsTable(table, correlationDataTable, action, 'correlation_');
    }
    var payloadDataTable = document.getElementById("outputPayloadDataTable");
    if (payloadDataTable.rows.length > 1) {
        populateAnalyticsTable(table, payloadDataTable, action, '');
    }
}

function populateAnalyticsIndexTable(eventStreamName) {
    createAnalyticsIndexTable('edit');
    jQuery.ajax({
        type: "GET",
        url: "../eventstream/get_analytics_index_definitions_ajaxprocessor.jsp?eventStreamName=" + eventStreamName,
        data: {},
        dataType: "text",
        async: false,
        success: function (result) {
            var IS_JSON = true;
            try {
                var resultJson = JSON.parse(result.trim());
            } catch (err) {
                IS_JSON = false;
            }
            if (IS_JSON) {
                var table = document.getElementById('analyticsIndexTable');
                for (var i in resultJson) {
                    for (var j = 1; j < table.rows.length; j++) {
                        var row = table.rows[j];
                        var columnName = row.cells[1].textContent;
                        if (columnName.trim() == resultJson[i].columnName) {
                            row.cells[0].childNodes[0].checked = true;
                            if (row.cells[2].childNodes[0].options[row.cells[2].childNodes[0].selectedIndex].text == 'STRING') {
                                var select = row.cells[2].childNodes[0];
                                for (var k = 0; k < select.options.length; k++) {
                                    if (select.options[k].text === resultJson[i].columnType) {
                                        select.selectedIndex = k;
                                        break;
                                    }
                                }
                            }
                            row.cells[3].childNodes[0].checked = resultJson[i].primaryKey;
                            row.cells[4].childNodes[0].checked = resultJson[i].indexed;
                            row.cells[5].childNodes[0].checked = resultJson[i].scoreParam;
                            break;
                        }
                    }
                }
            } else {
                CARBON.showErrorDialog("Failed to get index information, Exception: " + result);
            }
        }
    });
}

function getAnalyticsIndexDataValues(dataTable) {
    var wso2EventData = "";
    for (var i = 1; i < dataTable.rows.length; i++) {
        var row = dataTable.rows[i];
        var persist = row.cells[0].childNodes[0].checked;
        var columnName = row.cells[1].textContent.trim();
        var type = row.cells[2].childNodes[0].options[row.cells[2].childNodes[0].selectedIndex].text;
        var primary = row.cells[3].childNodes[0].checked;
        var index = row.cells[4].childNodes[0].checked;
        var scoreParam = row.cells[5].childNodes[0].checked;
        wso2EventData = wso2EventData + persist + "^=" + columnName + "^=" + type + "^=" + primary + "^=" + index + "^=" + scoreParam + "^=" + "$=";
    }
    return wso2EventData;
}
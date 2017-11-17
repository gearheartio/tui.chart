tui.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_lineAreaComboChart.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Line and Area Combo chart.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar ChartBase = require('./chartBase');\nvar axisTypeMixer = require('./axisTypeMixer');\nvar autoTickMixer = require('./autoTickMixer');\nvar zoomMixer = require('./zoomMixer');\nvar addingDynamicDataMixer = require('./addingDynamicDataMixer');\nvar comboTypeMixer = require('./comboTypeMixer');\nvar verticalTypeComboMixer = require('./verticalTypeComboMixer');\n\nvar LineAreaComboChart = tui.util.defineClass(ChartBase, /** @lends LineAreaComboChart.prototype */ {\n    /**\n     * className\n     * @type {string}\n     */\n    className: 'tui-combo-chart',\n    /**\n     * Line and Area Combo chart.\n     * @constructs LineAreaComboChart\n     * @extends ChartBase\n     * @param {Array.&lt;Array>} rawData - raw data\n     * @param {object} theme - chart theme\n     * @param {object} options - chart options\n     */\n    init: function(rawData, theme, options) {\n        this._initForVerticalTypeCombo(rawData, theme, options);\n        this._initForAutoTickInterval();\n        this._initForAddingData();\n    },\n\n    /**\n     * On change selected legend.\n     * @param {Array.&lt;?boolean> | {line: ?Array.&lt;boolean>, column: ?Array.&lt;boolean>}} checkedLegends checked legends\n     */\n    onChangeCheckedLegends: function(checkedLegends) {\n        var zoomedRawData = this.dataProcessor.getZoomedRawData();\n        var rawData = this._filterCheckedRawData(zoomedRawData, checkedLegends);\n        var chartTypesMap = this._makeChartTypesMap(rawData.series, this.options.yAxis);\n\n        tui.util.extend(this, chartTypesMap);\n\n        this._changeCheckedLegends(checkedLegends, rawData, chartTypesMap);\n    }\n});\n\ntui.util.extend(LineAreaComboChart.prototype,\n    axisTypeMixer, autoTickMixer, zoomMixer, addingDynamicDataMixer, comboTypeMixer, verticalTypeComboMixer);\n\nmodule.exports = LineAreaComboChart;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"
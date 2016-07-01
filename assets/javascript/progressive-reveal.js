'use strict';

var _ = require('underscore');

var helpers = require('./helpers');

var inputs, groups,
    selects,
    toggleAttr = 'data-toggle',
    hiddenClass = 'js-hidden';

function inputClicked(e, target) {
    target = target || helpers.target(e);
    var shown;
    _.each(groups[target.name], function (input) {
        var id = input.getAttribute(toggleAttr);
        // check if the element supplied is part of an {id}-panel
        // if so then toggle this parent element to also toggle
        // associated labels and legends
        var toggle = document.getElementById(id + '-panel') || document.getElementById(id);
        if (toggle) {
            if (input.checked) {
                input.setAttribute('aria-expanded', 'true');
                toggle.setAttribute('aria-hidden', 'false');
                helpers.removeClass(toggle, hiddenClass);
                shown = toggle.id;
            } else {
                input.setAttribute('aria-expanded', 'false');
                if (shown !== toggle.id) {
                    toggle.setAttribute('aria-hidden', 'true');
                    helpers.addClass(toggle, hiddenClass);
                }
            }
        }
    });
}

function setupReveal(input) {
    var toggleId = input.getAttribute(toggleAttr),
        toggle = document.getElementById(toggleId);

    if (toggle) {
        input.setAttribute('aria-controls', toggleId);
        inputClicked(null, input);
    }
    helpers.addEvent(input, 'click', inputClicked);
}

function setupRevealSelect(select) {
    var currentOption = select.options[select.selectedIndex];
    var toggleId = currentOption.getAttribute(toggleAttr);
    var toggle = document.getElementById(toggleId);

    if (toggle) {
        select.setAttribute('aria-controls', toggleId);
        toggleListener()
    }

    function toggleListener() {
        var currentOption = select.options[select.selectedIndex];
        var toggleId = currentOption.getAttribute(toggleAttr);
        var toggle = document.getElementById(toggleId);

        if (toggle) {
            for (var i = 0, len = select.options.length; i < len; i++) {
                var option = select.options[i];
                option.setAttribute('aria-expanded', 'false');
                var toggleId2 = option.getAttribute(toggleAttr);
                if (toggleId2) {
                    var toggleSection = document.getElementById(toggleId2);
                    toggleSection.setAttribute('aria-hidden', 'true');
                    helpers.addClass(toggleSection, hiddenClass);
                }
            }

            currentOption.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-hidden', 'false');
            helpers.removeClass(toggle, hiddenClass);
        }
    }

    helpers.addEvent(select, 'change', toggleListener);
}

function progressiveReveal() {
    var forms = document.getElementsByTagName('form'),
        input,
        select;

    if (forms.length > 0) {
        inputs = document.getElementsByTagName('input');
        selects = document.getElementsByTagName('select');
        groups = _.groupBy(inputs, 'name');
        for (var i = 0, num = inputs.length; i < num; i++) {
            input = inputs[i];
            if (input.type.match(/radio|checkbox/)) {
                helpers.once(input, 'progressive-reveal', setupReveal);
            }
        }
        for (var j = 0, jLen = selects.length; j < jLen; j++) {
            select = selects[j];
            helpers.once(select, 'progressive-reveal', setupRevealSelect);
        }
    }
}

module.exports = progressiveReveal;

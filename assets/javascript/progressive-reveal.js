'use strict';

var _ = require('underscore');

var helpers = require('./helpers');

var groups,
    toggleAttr = 'data-toggle',
    hiddenClass = 'js-hidden';

function inputClickedListener(target) {
    return function () {
        var shown;
        _.each(groups[target.name], function (input) {
            var id = input.getAttribute(toggleAttr);
            // check if the element supplied is part of an {id}-panel
            // if so then toggle this parent element to also toggle
            // associated labels and legends
            var toggle = document.getElementById(id + '-panel') || document.getElementById(id);
            if (!toggle) {
                return;
            }

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
        });
    };
}

function selectChangeListener(select) {
    return function () {
        var currentOption = select.options[select.selectedIndex],
            currentSectionToggleId = currentOption.getAttribute(toggleAttr),
            currentSectionToggle = document.getElementById(currentSectionToggleId);

        _.each(select.options, function (option) {
            option.setAttribute('aria-expanded', 'false');
            var toggleSectionId = option.getAttribute(toggleAttr),
                toggleSection = document.getElementById(toggleSectionId);

            if (!toggleSection) {
                return;
            }

            toggleSection.setAttribute('aria-hidden', 'true');
            helpers.addClass(toggleSection, hiddenClass);
        });

        if (currentSectionToggle) {
            currentOption.setAttribute('aria-expanded', 'true');
            currentSectionToggle.setAttribute('aria-hidden', 'false');
            helpers.removeClass(currentSectionToggle, hiddenClass);
        }
    };
}


function setupRevealForInputElement(input) {
    var sectionToggleId = input.getAttribute(toggleAttr),
        sectionToggle = document.getElementById(sectionToggleId);

    if (sectionToggle) {
        input.setAttribute('aria-controls', sectionToggleId);
        inputClickedListener(input)();
    }

    helpers.addEvent(input, 'click', inputClickedListener(input));
}

function setupRevealForSelectElement(select) {
    var currentOption = select.options[select.selectedIndex],
        sectionToggleId = currentOption.getAttribute(toggleAttr),
        sectionToggle = document.getElementById(sectionToggleId);

    if (sectionToggle) {
        select.setAttribute('aria-controls', sectionToggleId);
        selectChangeListener(select)();
    }

    helpers.addEvent(select, 'change', selectChangeListener(select));
}

function progressiveReveal() {
    var forms = document.getElementsByTagName('form'),
        inputs = document.getElementsByTagName('input'),
        selects = document.getElementsByTagName('select');

    if (forms.length === 0) {
        return;
    }

    groups = _.groupBy(inputs, 'name');

    _.each(inputs, function (input) {
        if (/radio|checkbox/.test(input.type)) {
            helpers.once(input, 'progressive-reveal', setupRevealForInputElement);
        }
    });

    _.each(selects, function (select) {
        helpers.once(select, 'progressive-reveal', setupRevealForSelectElement);
    });
}

module.exports = progressiveReveal;

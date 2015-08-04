/*
 *  progressforms - v1.0.1
 *  JQuery plugin that splits a form into multiple steps with a progress bar
 *  https://github.com/anthony-benavente/progressforms.git
 *
 *  Made by Anthony Benavente
 *  Under MIT License
 */
;(function($, window, document, undefined) {
	/**
	 * Name of the plugin
	 */
	var pluginName = "progressforms";

	/**
	 * All fieldsets in the container (the element where the plugin was
	 * initialized at)
	 */
	var fieldsets;

	/**
	 * This is the generated progress bar from the tabs field in the
	 * settings
	 */
	var progressBar;

	/**
	 * All dots that mark progress of the form
	 */
	var progressBarDots;

	/**
	 * The element where the plugin was initialized at
	 */
	var container;

	/**
	 * The current "page"
	 */
	var currentIndex = 0;

	/**
	 * The current visible fieldset
	 */
	var currentFieldset;

	/**
	 * The fieldset before the current one
	 */
	var previousFieldset;

	/**
	 * Fieldset with the confirmation message
	 */
	var confirmationFieldset;

	/**
	 * Loaded settings of the plugin
	 */
	var settings;

	/**
	 * Methods for the plugin
	 */
	var methods = {
		init: function(options) {
			settings = $.extend(true, $.fn.progressforms.defaults, options);

			container = $(this);
			fieldsets = container.children('fieldset');
			for (var i = 0; i < fieldsets.length; i++) {
				if (i !== 0) {
					$(fieldsets[i]).hide();
				}
			}

			currentFieldset = $(fieldsets[0]);
			progressBar = generateProgressBar();
			progressBarDots = progressBar.find('li');
			container.prepend(progressBar);
			setListSize();
			addPrevNextButtons();
			container.addClass('progressformswrapper');

			return container;
		},
		goToTab: function(index) {
			if (index >= 0 && index < fieldsets.length) {
				if (index > currentIndex) {
					for (var i = currentIndex; i < index; i++) {
						onNextClick();
					}
				} else {
					for (var j = currentIndex - 1; j >= index; j--) {
						onPrevClick();
					}
				}
			} else {
				$.error('There is no fieldset at index ' + index);
			}
		},
		goToTabId: function(id) {
			var toGoTo = fieldsets.filter(function() { return $(this).attr('id') === id });
			methods.goToTab(fieldsets.index(toGoTo));
		}
	};

	/**
	 * Sets the widths of each progress bar list item so that it is spread out
	 * evenly
	 */
	function setListSize() {
		var percentage = 100.0 / progressBarDots.length;
		$(progressBarDots).each(function() {
			$(this).css('width', percentage + '%');
		});
	}

	/**
	 * Generates the actual progress bar based off the tabs array in the
	 * settings object.
	 *
	 * @return The progress bar as a JQuery DOM element
	 */
	function generateProgressBar() {
		var progressBar = $('<ul class="progressBar"></ul>');
		var onProgressItemClick = function() {
			var listItems = container.find('.progressBar li');
			for (var i = 0; i < listItems.length; i++) {
				if (listItems[i] === this) {
					if (i > currentIndex && settings.canClickForward && $(fieldsets[i]).data('previously-validated')) {
						methods.goToTab(i);
					} else if (i < currentIndex && settings.canClickBackward) {
						methods.goToTab(i);
					}
					break;
				}
			}
		};

		if (settings.tabs.length === 0) {
			for (var i = 0; i < fieldsets.length; i++) {
				var title = $(fieldsets[i]).find('legend');

				if (title) {
					settings.tabs.push(title.html());
				} else {
					settings.tabs.push('');
				}
			}
		}
		for (var i = 0; i < settings.tabs.length; i++) {
			var toAppend = $('<li>').html(settings.tabs[i]);
			if (i === 0) {
				toAppend.addClass('active');
			}
			if (settings.canClickForward || settings.canClickBackward) {
				toAppend.click(onProgressItemClick);
			}
			progressBar.append(toAppend);
		}
		return progressBar;
	}

	/**
	 * This is a helper method to create a `next` button in each fieldset
	 * with the event for next buttons is attached. This method calls the
	 * createNextButton method found in the settings object (which can be
	 * overriden through the defaults or options)
	 *
	 * @return the next button generated by the createNextButton() method from
	 *   	  	the settings object. This should be a JQuery DOM element
	 */
	function _createNextButton() {
		var nextButton = settings.ui.createNextButton();
		nextButton.click(onNextClick);
		return nextButton;
	}

	/**
	 * This function gets called when the next button is pressed. It handles the
	 * logic of the hiding the current fieldset and then showing the next one in
	 * line. This method also calls the callback `onNext` found in the settings.callbacks
	 * object
	 */
	function onNextClick() {
		var notFilled = settings.validateRequired ? validateRequiredFields(currentFieldset) : false;

		// Prevent current index from gettings higher than range of fieldsets
		if (currentIndex + 1 >= fieldsets.length) {
			currentIndex--;
		} else if (notFilled) {
			settings.callbacks.onValidateRequiredFailed(notFilled);
		} else {
			$(progressBarDots[currentIndex]).addClass('completed').removeClass('active');
			var tabClicked = $(fieldsets[currentIndex]);
			// Increment the current index to the next fieldset
			currentIndex++;

			previousFieldset = $(currentFieldset);
			currentFieldset = $(fieldsets[currentIndex]);
			if (previousFieldset) {
				$(previousFieldset).hide();
			}
			$(currentFieldset).show();
			$(progressBarDots[currentIndex]).addClass('active');
			$(previousFieldset).data('previously-validated', true);

			settings.callbacks.onNext(tabClicked, currentFieldset);

			if (currentIndex === fieldsets.length - 1) {
				settings.callbacks.onLastTabEntered();
			}
		}
	}

	/**
	 * This helper method goes through all required, visible fields within the
	 * specified fieldset (container) and returns the element that is not filled.
	 * Also, if all required fields are filled, then the method calls the
	 * validateReuiredFunctions for the specific fieldset index if it exists.
	 * This method runs additional logic to verify that any custom requirements
	 * are passed before going to the next fieldset.
	 *
	 * @returns The HTML DOM element that did not meet the validation requirements
	 */
	function validateRequiredFields(fieldset) {
		var notFilled;
		var valid = true;

		var requiredFields = $(fieldset).find('[required]');
		var i = 0;

		for (i = 0; i < requiredFields.length && notFilled === undefined; i++) {
			if ($(requiredFields[i]).is(':visible') && $(requiredFields[i]).val() === '') {
				notFilled = $(requiredFields[i]);
			}
		}

		if (!notFilled) {
			// Look for check boxes
			var requiredCheckboxGroups = $(fieldset).find('[data-required]');
			for (i = 0; i < requiredCheckboxGroups.length; i++) {
				var numRequired = parseInt($(requiredCheckboxGroups[i]).attr('data-required') || 1);
				var numChecked = 0;
				var checkboxes = $(requiredCheckboxGroups[i]).find('input[type="checkbox"]');
				var checked = false;

				for (var j = 0; j < checkboxes.length && !checked; j++) {
					if ($(checkboxes[j]).is(':checked')) {
						checked = ++numChecked == numRequired;
					}
				}

				if (!checked && checkboxes.length > 0) {
					notFilled = $(checkboxes[0]);
				}
			}
		}

		if (!notFilled && typeof settings.validateRequiredFunctions[currentIndex] == 'function') {
			notFilled = settings.validateRequiredFunctions[currentIndex](fieldset);
		}

		return notFilled;
	}

	/**
	 * This is a helper method to create a `next` button in each fieldset
	 * with the event for next buttons is attached. This method calls the
	 * createNextButton method found in the settings object (which can be
	 * overriden through the defaults or options)
	 *
	 * @return the next button generated by the createNextButton() method from
	 *   	  	the settings object. This should be a JQuery DOM element
	 */
	function _createPrevButton() {
		var prevButton = settings.ui.createPrevButton();
		prevButton.click(onPrevClick);
		return prevButton;
	}

	/**
	 * This function gets called when the previous button is pressed. It handles the
	 * logic of the hiding the current fieldset and then showing the fieldset before
	 * the current one. This method also calls the callback `onPrev` found in the
	 * settings.callbacks object.
	 */
	function onPrevClick() {
		$(progressBarDots[currentIndex]).removeClass('active');
		// Prevent current index from gettings higher than range of fieldsets
		if (--currentIndex < 0) {
			currentIndex++;
		} else {
			$(currentFieldset).hide();
			var tabClicked = $(currentFieldset);
			currentFieldset = previousFieldset;
			previousFieldset = currentIndex > 0 ? $(fieldsets[currentIndex - 1]) : undefined;
			$(currentFieldset).show();
			$(progressBarDots[currentIndex]).addClass('active');

			settings.callbacks.onPrev(tabClicked, currentFieldset);
		}
	}

	/**
	 * This method adds a container that contain the next and previous buttons
	 * to every sub-form in the multi-step form.
	 */
	function addPrevNextButtons() {
		for (var i = 0; i < fieldsets.length; i++) {
			var nextPrevBar = $('<div class="next-prev-bar">');
			if (i === 0) {
				// Only add next
				nextPrevBar.append(_createNextButton());
			} else if (i === fieldsets.length - 1) {
				// Only add previous
				nextPrevBar.append(_createPrevButton());
			} else {
				// Add next and previous
				nextPrevBar.append(_createPrevButton());
				nextPrevBar.append(_createNextButton());
			}
			$(fieldsets[i]).append(nextPrevBar);
		}
	}


	$.fn.progressforms = function(options) {
		if (methods[options]) {
			return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof options === 'object' || !options) {
			return methods.init.apply(this, arguments);
		} else {
			$.error(options + ' is not a valid method in progressforms');
		}
	};

	$.fn.progressforms.defaults = {
		clickForward: false,

		clickBack: false,

		/**
		 * This array holds the names of each sub-form in the form
		 */
		tabs: [],

		/**
		 * This variable determines if required fields are validated before going
		 * to the next fieldset
		 */
		validateRequired: true,

		/**
		 * Set this in order to override the default check per page
		 *
		 * The signature of the functions passed in should be
		 *     function(currentFieldset):object
		 */
		validateRequiredFunctions: [],

		/**
		 * This object holds all the callbacks that are fired during the lifetime
		 * of the plug in
		 */
		callbacks: {
			onNext: function(tabClicked, tabEntered) {},
			onPrev: function(tabClicked, tabEntered) {},
			onLastTabEntered: function() {},
			onValidateRequiredFailed: function(notFilled) {
				alert("Please fill out all required fields!");
				notFilled.focus();
			}
		},
		ui: {
			createNextButton: function() {
				return $('<button type="button" class="next">').html("Next");
			},
			createPrevButton: function() {
				return $('<button type="button" class="prev">').html("Previous");
			}
		}
	};
})(jQuery, window, document);

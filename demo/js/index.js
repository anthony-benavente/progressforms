$(function() {
	var verifyPassword = function(fieldset) {
		var password = fieldset.find('#password').val();
		var confirmpassword = fieldset.find('#confirmpassword').val();
		if (password !== confirmpassword) alert("Passwords must match!");
		return password === confirmpassword ? undefined : $('#password');
	};

	$('#progressFormWrapper').progressforms({
		clickForward: true,
		clickBack: true,
		clickVisitedOnly: false,
		validateRequiredFunctions: {
			'Personal Information': verifyPassword
		},
		callbacks: {
			onValidateRequiredFailed: function(notFilled) {
				notFilled.addClass('validate-failed');
				notFilled.focus();
			},
			onLastTabEntered: function() {
			},
			onNext: function(a, b) {
				console.log("We just nexted: ");
				console.log(a);
				console.log(b);
			},
			onProgressClicked: function(li, target) {
				console.log("Clicked on " + $(li).html());
				console.log($(target).attr('id'));
			}
		},
        ui: {
			progressBarTarget: '#myProgressBar',
            createNextButton: function() {
                return $('<button type="button" class="next">').html('Next <i class="fa fa-caret-right"></i>');
            },
            createPrevButton: function() {
                return $('<button type="button" class="prev">').html('<i class="fa fa-caret-left"></i> Previous');
            }
        }
	});

	// $('#progressFormWrapper').progressforms('goToTabId', window.location.hash.slice(1));

	$('#myonoffswitch').change(function() {
		if ($(this).is(':checked')) {
			$('#hidingWindow').show();
		} else {
			$('#hidingWindow').hide();
		}
	}).change();

});

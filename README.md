progressforms
===

This JQuery plugin utilizes the tutorial for a multi-step JQuery form
with a progress bar found [here](http://codepen.io/atakan/pen/gqbIz).

### How to Use

#### Initialization
In order to initialize progressforms, you must call the function on an element that has children that are fieldsets. The way that the plug-in separates the form into segments is by using segments that are the first set of children underneath the HTML element of which `progressforms()` was invoked. Below is an example of a structure that would work for the plug-in.

```html
<div id="progressforms-wrapper">
	<fieldset>
        <legend>Name</legend>
        <label for="name">Name:</label>
        <input id="name">
    </fieldset>
	<fieldset>
        <legend>Email</legend>
        <label for="email">Email:</label>
        <input id="email" type="email">
    </fieldset>
    <fieldset>
        <legend>Confirmation</legend>
        <input type="submit" value="Submit">
    </fieldset>
</div>
```

And then to make initialize the function, you need to be sure to have JQuery on the page as well as the script for this plug in like so:

```html
<script src="path/to/jquery.js"></script>
<script src="path/to/jquery.progressforms.js"></script>
```

And then to initialize the plug-in on an element, simply run the following:
```javascript
    $(function() {
        $('#progressforms-wrapper').progressforms();
    });
```

#### Methods
This plugin has two methods that can be used to jump to specific tabs based on index or their container IDs. They 
are listed and described below:

**function goToTab(index)**  
Parameters:
  1. index (Number) - This paramter is the index in the fieldset in the range [0, n) where n is the number of tabs
  in the form. If this is invalid or out of bounds, the plugin will throw an exception.
  
**function goToTabById(id)**
Parameters:
  1. id (String) - This parameter is the id of the container for the page in the form. If the id doesn't exist, the
  plugin will throws an exception.

### Options
**clickForward**  
Type: `Boolean` Default: `false`  
`clickForward` allows for the ability to click on dots in the progress bar in the
forward direction and have the form automatically switch to that page. If it is set to
false, you cannot click the progress bar in the forward direction.

**clickBack**  
Type: `Boolean` Default: `false`  
`clickBack` allows you to click on previously completed pages in the progress bar and will automatically switch to that page.

**tabs**  
Type: `Array` of `String` Default: `[]`  
By default, `progressforms` names each progress bar by the legend in each of the fieldsets of the container in which progressforms was initialized on. To override these titles, pass in the array where the index of each string corresponds to that page in the form.

**validateRequired**  
Type: `Boolean` Default: `true`  
When `validateRequired` is enabled, before the form goes to the next page, each [required] field will be checked and returned if no data is inputted. If this is set to false, no validation will occur.

**validateRequiredFunctions**  
Type: `Array` of `Function` Default: `{}`  
This array holds extra functions that are used for validation. Each function is essentially a callback that gets called *only after* the default validate function passes. In order to specify which function to assign to which page of the form, use the name of the page that will appear in the progress bar which is specified through either the `tabs` property or by the legend that appears at the top of the fieldset. An example of a proper validateRequiredFunctions object is below:

```javascript
    var validateRequiredFunctions = {
        // For page 1
        'Personal Information': function(fieldset) {
            // The fieldset in the parameter is the current fieldset
            var password = fieldset.find('#password');
            if (password.val() !== fieldset.find('#confirm').val()) {
                return password; // The password field caused the error
            }
        }
    };
```

**callbacks**  
Type: `Object`  
See **callbacks** section below for more information.

**ui**  
Type: `Object`  
See **ui** section below for more information

#### Callbacks
Progress-forms has a set of functions known as `callbacks` that are called during certain parts of the plug-ins lifetime. For example, the `onInit()` callback is called as soon as the plug-in is initialized. In order to create your own callback functions, you must specify the callbacks option when initializing JQuery. An example is below:

```javascript
$(function() {
    $('#progressForm').progressforms({
        callbacks: {
            onInit: function() { },
            onNext: function(tabClicked, tabEntered) { },
            onPrev: function(tabClicked, tabEntered) { },
            onLastTabEntered: function() { },
            onValidateRequiredFailed: function(notFilled) { }
        }
    })
})
```

**onInit**  `function() { }`  
This function is called as soon as the plug-in is initialized.

**onNext** `function(tabClicked, tabEntered)`  
This function is called whenever the next button is pressed.  
`tabClicked` - This is a JQuery element that is the tab that the form was on just before the next button was pressed  
`tabEntered` - This is a JQuery element that is the tab that the form moved to just after the next button was pressed  

**onPrev**  
This function is called whenever the previous button is pressed.  
`tabClicked` - This is a JQuery element that is the tab that the form was on just before the previous button was pressed  
`tabEntered` - This is a JQuery element that is the tab that the form moved to just after the previous button was pressed  

**onLastTabEntered** `function() { }`  
This function gets called when the form enters the last page.

**onValidateRequiredFailed** `function(notFilled)`  
This function gets called whenever the validation functions do not all pass (this includes the custom ones). By default, this function causes an alert to show and focuses on the field not filled, i.e., `notFilled`.  
`notFilled` - This is a JQuery element that is an input field that was not filled out even though it was marked [required]. In addition, any field returned from any of the `validateFailedFunctions` could also be passed in here.

### UI
Certain elements of the plug-in are created through functions. You can override these function by adding the `ui` option when initializing the plug-in. Note that in order for all UI functions to work, **you must return an HTML element.**

```javascript
$(function() {
    $('#progressForm').progressforms({
        ui: {
            createNextButton: function() {
                return $('<button type="button">').html('Next');
            },
            createPrevButton: function() {
                return $('<button type="button">').html('Previous');
            }
        }
    })
})
```

**createNextButton**  `function() { }`  
This method is used when creating the next button used for moving to the next pages in the form.

**createPrevButton** `function() { }`  
This method is used when creating the previous button used for moving back pages in the form.

### Required Fields
Progressforms automatically validates that all fields that have the required attribute are actually filled out before continuing to the next tab. This can also be set up to work for check boxes where a minimum amount need to be checked. In order for this to work, the check boxes need to be wrapped in a containing element with the attribute `data-required` on it. The attribute can also have a value to specify how many check boxes must be checked in order for the requirement to be satisfied. Below is an example of how to set up a check box group.

```html
<div id="progressforms-wrapper">
    <fieldset>
        <label>Check one or more.</label>

        <!-- Only one check box needs to be checked to move on -->
        <div data-required="1">
            <input type="checkbox" id="chk1">
            <input type="checkbox" id="chk2">
            <input type="checkbox" id="chk3">
        </div>
    </fieldset>
    <fieldset>

        <!-- Now two check boxes needs to be checked to move on -->
        <label>Check two or more.</label>
        <div data-required="2">
            <input type="checkbox" id="chk1">
            <input type="checkbox" id="chk2">
            <input type="checkbox" id="chk3">
        </div>
    </fieldset>
</div>
```

#### Demo
To see a styled example of the page, clone this project and open up index.html in the browser.

### Contributors
  1. Anthony Benavente
  2. Daniel Powell

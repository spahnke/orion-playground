defineModule('person', () =>
	class Person {
		
		constructor(firstName, lastName) {
			this.firstName = firstName;
			this.lastName = lastName;
		}
		
		greet() {
			return "Hello I'm " + this.firstName + " " + this.lastName;
		}
	}
);
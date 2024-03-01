let instance = null;
let sequenceNumber = Math.floor(Math.random() * (1 << 26));
let timerValue = Math.floor(Math.random() * 999) + 1;

// Singleton constructor function
function Singleton() {
    // Private properties
    sequenceNumber = Math.floor(Math.random() * (1 << 26));
    const timerInterval = setInterval(() => {
        // Increment the timer value by 1 every tick
        timerValue++;

        // Check if the timer value has reached 2^32
        if (timerValue >= Math.pow(2, 32)) {
            // Reset the timer value to 0
            timerValue = 0;
        }
    }, 10);

    // Private methods
    function incrementSequenceNumber() {
        sequenceNumber++;
    }

    // Public methods
    this.getSequenceNumber = function() {
        incrementSequenceNumber();
        return sequenceNumber;
    };

    this.getTimestamp = function() {
        return timerValue;
    }
}

// Initialize the Singleton instance if not already initialized
function initSingleton() {
    if (!instance) {
        instance = new Singleton();
    }
}

// Exported methods
module.exports = {
    init: function() {
        initSingleton();
    },

    getSequenceNumber: function() {
        initSingleton();
        return instance.getSequenceNumber();
    },

    getTimestamp: function() {
        initSingleton();
        return instance.getTimestamp();
    }
};

// String Utils
function pad(str, length, padStr, type) {
    /* jshint ignore:start, unused:false */
    str = str == null ? '' : String(str);
    length = ~~length;

    var padlen = 0;

    if (!padStr)
        padStr = ' ';
    else if (padStr.length > 1)
        padStr = padStr.charAt(0);

    switch (type) {
        case 'right':
            padlen = length - str.length;
            return str + strRepeat(padStr, padlen);
        case 'both':
            padlen = length - str.length;
            return strRepeat(padStr, Math.ceil(padlen / 2)) + str +
                strRepeat(padStr, Math.floor(padlen / 2));
        default: // 'left'
            padlen = length - str.length;
            return strRepeat(padStr, padlen) + str;
    }

    function strRepeat(str, qty) {
        if (qty < 1) return '';
        var result = '';
        while (qty > 0) {
            if (qty & 1) result += str;
            qty >>= 1, str += str;
        }

        return result;
    }
    /* jshint ignore:end */
}

function insert(string, index, value) {
    return [
        string.substring(0, index),
        value,
        string.substring(index, string.length)
    ].join('');
}

function capitalize(value) {
    if (typeof value !== 'string') {
        return value;
    }

    return value.substr(0, 1).toUpperCase() + value.substr(1);
}

// Array Utils
function series(from, to) {
    var params = [from, to];
    if (from > to) {
        params = [to, from];
    }

    var result = [];
    while (params[0] <= params[1]) {
        result.push(params[0]++);
    }

    return from > to ? result.reverse() : result;
}

// Date Utils
function isValidDate(date) {
    //http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
    if (Object.prototype.toString.call(date) !== '[object Date]') {
        return false;
    }

    return !isNaN(date.getTime());
}

// Math Utils
function mod(value, factors, divider, direction) {
    var reduceSummationTerms = false,
        cumplimentaryToDivider = false;

    if (arguments.length === 1 && typeof value === 'object') {
        factors = value.factors;
        divider = value.divider;
        direction = value.direction;
        reduceSummationTerms = value.reduceSummationTerms;
        cumplimentaryToDivider = value.cumplimentaryToDivider;
        value = value.value;
    }

    if (divider === undefined) {
        divider = 11;
    }

    if (factors === undefined) {
        factors = series(2, 9);
    }

    if (direction === undefined) {
        direction = 'rightToLeft';
    }

    var reduceMethod = direction === 'leftToRight' ? 'reduce' : 'reduceRight';

    var i = 0;
    var result = value.split('')[reduceMethod](function (last, current) {
        if (i > factors.length - 1) {
            i = 0;
        }

        var total = factors[i++] * parseInt(current, 10);

        const sum = (a, b) => a + b;

        if (reduceSummationTerms) {
            total = total.toString().split('').map(Number).reduce(sum, 0);
        }

        return total + last;
    }, 0) % divider;

    if (cumplimentaryToDivider) {
        result = divider - result;
    }

    return result;
}

// Object Utils
function merge(destination, source) {
    if (destination === undefined) destination = {};
    if (source === undefined) source = {};

    return Object.assign(destination, source);
}

// Stream Utils
function handleStream(stream) {
    return new Promise(function (resolve, reject) {
        stream.on('end', () => resolve(stream));
        stream.on('error', () => reject);
    });
}

// Export all utils
module.exports = {
    pad,
    insert,
    capitalize,
    series,
    isValidDate,
    mod,
    merge,
    handleStream
};
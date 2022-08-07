module.exports = utils = {
    removeItemOnce: (arr, value) => {
        let index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
        }
        return arr;
    },
    swap: (a, b) => {
        let temp = a;
        a = b;
        b = temp;
    },
    seatSort: (arr) => {
        let regex = /\d+/g;
        function map(str) {
            var matches = str.match(regex);
            return matches.map(str => {
                return Number(str);
            });
        }
        return arr.sort((a, b) => {
            let av = map(a.id), bv = map(b.id);
            if (av.length > bv.length)
                this.swap(av, bv);
            for (let i = 0; i < av.length; i++) {
                if (av[i] < bv[i])
                    return -1;
                if (av[i] > bv[i])
                    return 1;
            }
            return 0;
        });
    }
}
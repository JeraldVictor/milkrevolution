new Vue({
    el: '#app',
    data: {
        date:'',
        per:'',
        qt:'',
        total:'',
        list:''
    },
    created() {
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        let month = Number(date.getMonth() ) + 1
        this.date =   date.getDate() + "/" + month  + "/" + date.getFullYear() + " - " + strTime;
    },
    filters: {
        cur: function (val) {
            return `₹ ${ new Intl.NumberFormat('en-IN', {maximumSignificantDigits: 3}).format(val) }`
        }
    },
    watch: {
        qt(){
            this.total = this.per * this.qt
        }
    },
});
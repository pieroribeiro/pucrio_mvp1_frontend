function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    return div.firstChild;
}

function Right(str, n){
    if (n <= 0) {
        return "";
    } else if (n > String(str).length) {
        return str;
    } else {
        var iLen = String(str).length;
        return String(str).substring(iLen, iLen - n);
    }
}

function formatDate(dateString) {
    const d = new Date(dateString)
    const day = Right(`00${d.getDay()}`, 2)
    const month = Right(`00${d.getMonth()+1}`, 2)
    const year = d.getFullYear()
    const hour = Right(`00${d.getHours()}`, 2)
    const minute = Right(`00${d.getMinutes()}`, 2)

    return `${day}/${month}/${year} às ${hour}:${minute}`
}

function formatCurrency (value) {
    return (
        new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        
            // These options are needed to round to whole numbers if that's what you want.
            //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
            //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
        })
    ).format(value)
}

function removeClassFromSiblings (el, className) {
    el.previousSibling.forEach(item => {
        item.classList.remove(className)
    })

    el.nextSibling.forEach(item => {
        item.classList.remove(className)
    })
}
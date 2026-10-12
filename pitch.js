// Validates the guest-post pitch, then opens WhatsApp or the email app with it filled in.
(function () {
    var WHATSAPP = '923019621417';
    var EMAIL = 'aliahmad@amrzdigitalmarket.com';
    var form = document.getElementById('pitchForm');
    if (!form) return;
    var via = 'whatsapp';
    form.querySelectorAll('[data-via]').forEach(function (b) {
        b.addEventListener('click', function () { via = b.dataset.via; });
    });
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var first = null;
        form.querySelectorAll('.fld').forEach(function (f) {
            var input = f.querySelector('input, select, textarea');
            var ok = input.checkValidity();
            f.classList.toggle('bad', !ok);
            if (!ok && !first) first = input;
        });
        if (first) { first.focus(); return; }
        var lines = ['Guest Post Pitch for AMR.Z DigitalMarket', ''];
        form.querySelectorAll('[data-field]').forEach(function (el) {
            if (el.value.trim()) lines.push(el.dataset.field + ': ' + el.value.trim());
        });
        var text = lines.join('\n');
        if (via === 'email') {
            var subject = 'Guest Post Pitch: ' + document.getElementById('p-title').value.trim();
            location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
        } else {
            window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
        }
    });
})();

$(document).ready(function() {
    Sentence.init();
});

var Sentence = {
    sentences: null,
    init: function () {
        this.sentences = $('.for_selection');
        this.parse(this.sentences);
        this.dataBoud($('.sentence'));
    },
    parse: function(els) {
        els.find('*').each(function () {
            var parts = $(this).html().split(/([\.\?!])(?= )/);

            $(this).html(Sentence.map(Sentence.addDots(parts)));
        });
    },
    addDots: function(parts) {
        var parts_comma =[];
        for (var i = 0; i < parts.length; i += 2) {
            parts_comma.push(parts[i] + (parts[i + 1] ? parts[i + 1] : ''));
        }
        return parts_comma;
    },
    map: function(parts_comma) {
        return parts_comma.map(
            function (v) {
                return Sentence.build(v)
            }
        );
    },
    build: function (v) {
        return '<span class=sentence>' + v + '</span>';
    },
    dataBoud: function (els) {
        els.each(function () {
            Sentence.mouseEnter($(this));
            Sentence.mouseLeave($(this));
        });
        this.sentences.dblclick(Sentence.dblclick);
    },
    mouseEnter: function (el) {
        $(el).mouseenter(function () {
            if (!$(el).hasClass("blue")) {
                $(el).addClass("blue");
            }
            console.log($(el).text());
        })
    },
    mouseLeave: function (el) {
        $(el).mouseleave(function () {
            if ($(el).hasClass("blue")) {
                $(el).removeClass("blue");
            }
        });
    },
    dblclick: function(e) {
        var range = window.getSelection() || document.getSelection() || document.selection.createRange();
        var word = $.trim(range.toString());
        if(word != '') {
            alert(word);
        }
    }
};
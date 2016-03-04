$(document).ready(function() {
    Sentence.init();
});

var Sentence = {
    sentences: null,
    current: null,
    init: function () {
        this.sentences = $('.for_selection');
        this.parse(this.sentences);
        this.dataBoud($('.sentence'));
    },
    parse: function(els) {
        console.log(Sentence.current);
        els.find('*').each(function () {
            $(this).html($(this).html().split(/([\.\?!])(?= )/).map(
                function (v) {
                    return Sentence.build(v)
                }
            ));
        });
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
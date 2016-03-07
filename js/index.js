$(document).ready(function() {
    Sentence.init();
});

var Sentence = {
    sentences: null,
    parsed: [],
    index: 0,
    chunkSize: 10,
    chunkArray: [],
    skipTags:['script', 'noscript', 'applet', 'embed', 'object', 'param', 'style', 'pre', 'code'],
    formattingTags:[
        'ACRONYM', 'ABBR', 'ADDRESS', 'B', 'BDI', 'BDO', 'BIG', 'BLOCKQUOTE', 'CENTER', 'CITE', 'BR',
        'DEL', 'DFN', 'EM', 'FONT', 'I', 'INS', 'KBD', 'MARK', 'METER', 'PROGRESS', 'Q', 'RP', 'VAR',
        'RT', 'RUBY', 'S', 'SAMP', 'SMALL', 'STRIKE','STRONG', 'SUB', 'SUP', 'TIME', 'TT', 'U', 'WBR'
    ],
    tooltipTimeout: null,
    init: function () {
        this.sentences = $('body');
        this.parse(this.sentences);
        this.dataBound();
        this.showTooltip(this.parsed);
        $('[data-toggle="popover"]').popover();
    },
    parse: function(els) {
        els.find('*').each(function () {
            if (
                $(this).find('.sentence').length == 0
                && !$(this).hasClass('.sentence')) {

                if (
                    $(this).find('*').length > 0
                    && $.inArray($(this)[0].tagName.toUpperCase(), Sentence.formattingTags) == -1
                    && $.inArray($(this)[0].tagName.toLowerCase(), Sentence.skipTags) == -1
                ) {
                    $(this).contents().filter(function(){
                        return this.nodeType == 3;
                    }).each(
                        function(){
                            if ($(this).text().trim() != '') {
                                $(this).replaceWith(
                                    Sentence.map(
                                        Sentence.addDots(
                                            $(this).text().split(/([\.\?!\n])(?= )/),
                                            $(this).text().split(/([\.\?!\n])(?= )/)
                                        )
                                    )
                                );
                            }
                        }
                    );
                    Sentence.parse($(this));
                } else if ($.inArray($(this)[0].tagName.toLowerCase(), Sentence.skipTags) == -1) {

                    $(this).html(
                        Sentence.map(
                            Sentence.addDots(
                                $(this).html().split(/([\.\?!\n])(?= )/),
                                $(this).text().split(/([\.\?!\n])(?= )/)
                            )
                        )
                    );
                } else if ($(this).find('*').length > 0) {

                    $(this).html(
                        Sentence.map(
                            Sentence.parseSkip(
                                $(this).html().split(/([\.\?!\n])(?= )/),
                                $(this).text().split(/([\.\?!\n])(?= )/),
                                Sentence.skipTags
                            )
                        )
                    );
                }
            }
        });
        if (this.chunkArray.length > 0) {
            this.translate(this.chunkArray);
        }
    },
    addDots: function(parts, text) {
        var partsComma =[];
        for (var i = 0; i < parts.length; i += 2) {
            if (parts[i].trim() != '') {
                partsComma.push(Sentence.createNew(
                    parts[i] + (parts[i + 1] ? parts[i + 1] : ''),
                    text[i] + (text[i + 1] ? text[i + 1] : ''),
                    false
                ));
            }
        }

        return partsComma;
    },
    parseSkip: function(parts, text, skipTags) {
        var partsComma =[];
        var new_part = '';

        for (var i = 0; i < parts.length; i++) {
            if (parts[i].trim() != '') {
                for (var j = 0; j < skipTags.length; j++) {
                    var pos = parts[i].toLowerCase().indexOf('<' + skipTags[j]);

                    if (pos >= 0) {
                        new_part = parts[i].substring(pos, parts[i].lenght);
                        partsComma.push(Sentence.createNew(
                            parts[i].substring(0, pos), text[i].substring(0, pos), false)
                        );

                        var pos_end = new_part.toLowerCase().indexOf('/' + skipTags[j] + '>');

                        if (pos_end >= 0) {
                            new_part = new_part.substring(0, pos_end + ('/' + skipTags[j] + '>').length);
                            partsComma.push(Sentence.createNew(new_part, '', true));

                        } else {
                            i++;
                            var result = Sentence.findSkip(parts, i, new_part, skipTags[j]);
                            new_part = result.new_part;
                            i = result.index;
                            partsComma.push(Sentence.createNew(new_part, '', true));
                        }
                        j = skipTags.length;
                    }
                }
                if (new_part == '') {
                    partsComma.push(Sentence.createNew(
                        parts[i] + (parts[i + 1] ? parts[i + 1] : ''),
                        text[i] + (text[i + 1] ? text[i + 1] : ''),
                        (parts[i].trim() == '') ? true : false
                    ));
                    i++;
                } else {
                    new_part = '';
                }
            }
        }

        return partsComma;
    },
    findSkip: function(parts, i, new_part, tag) {
        var pos_end = parts[i].toLowerCase().indexOf('/' + tag + '>');
        var res = [];

        if (pos_end >= 0) {
            new_part += parts[i].substring(0, pos_end + ('/' + tag + '>').length);
            res = {new_part:new_part, index:i};
        } else {
            new_part += parts[i];
            i++;
            if (i < parts.length) {
                res = Sentence.findSkip(parts, i, new_part, tag);
            } else {
                res = {new_part:new_part, index:i};
            }
        }

        return res;
    },
    createNew: function(data, text, skip) {
        var obj = {
            id: this.index,
            origin: data,
            text:  text,
            skip: skip
        };
        Sentence.parsed.push(obj);
        this.index++;

        return obj;
    },
    map: function(partsComma) {
        return partsComma.map(
            function(v){
                if (!v.skip) {
                    Sentence.chunkArray.push(v);
                    if (Sentence.chunkArray.length%Sentence.chunkSize == 0) {
                        Sentence.translate(Sentence.chunkArray);
                        Sentence.chunkArray = [];
                    }
                }

                return Sentence.build(v)
            }
        );
    },
    build: function (v) {
        return v.text.trim() != '' && !v.skip ? '<span class="sentence" data-id="'
                    + v.id + '" data-toggle="popover" data-trigger="hover" title="Origin"'
                    + ' data-content="" data-placement="auto bottom">'
                    + v.origin + '</span>' : v.origin;
    },
    dataBound: function () {
        this.sentences.on('mouseenter', '.sentence', Sentence.mouseEnter);
        this.sentences.on('mouseleave', '.sentence', Sentence.mouseOver);

        this.sentences.dblclick(Sentence.dblclick);
    },
    mouseEnter: function (e) {
        $('.blue').each(function(){
            $(this).removeClass('blue');
        });
        if (!$(e.currentTarget).hasClass("blue")) {
            $(e.currentTarget).addClass("blue");
        }
    },
    mouseOver: function (e) {
        if ($(this).hasClass("blue")) {
            $(this).removeClass("blue");
        }
    },
    dblclick: function(e) {
        var range = window.getSelection() || document.getSelection() || document.selection.createRange();
        var word = $.trim(range.toString());
        if(word != '') {
            alert(word);
        }
    },
    doSomeStuff: function (els) {
        els.map(function (el) {
            el.translated = el.origin.toUpperCase();
        });

        return els;
    },
    translate: function (els) {
        //do some stuff with els; should be ajax call!
        var response = this.doSomeStuff(els);

        // then on success with response data
        this.showTooltip(response);
    },
    showTooltip: function (els) {
        els.map(function (el) {
            $("span[data-id='" + el.id + "']").data('content', el.text).html(el.translated);
        });
    }

};
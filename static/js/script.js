document.querySelectorAll('.delete-button').forEach((n,i) => {
    n.addEventListener('click', function(e){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'delete/'+e.target.dataset.id);
        xhr.onload = function() {
            if (xhr.status === 200) {
                //xhr.responseText
            }
        };
        xhr.send();
    })
});

document.querySelectorAll('.edit').forEach((n,i) => {
    n.addEventListener('click', function(e) {
        let name = document.querySelector("span[class*='name-autocomplete'][data-id='"+ e.target.dataset.id +"']");
        let input = document.querySelector("input[class*='name-autocomplete-input'][data-id='"+ e.target.dataset.id +"']");
        name.hidden = !name.hidden;
        input.hidden = !input.hidden;
        input.focus();
        input.select();
    });
});

document.querySelectorAll('.name-autocomplete-input').forEach((n,i) => {
    let name;
    let input;
    $(n).on( "keydown", function( event ) {
            if ( event.keyCode === $.ui.keyCode.TAB && event.key === "Enter" &&
                $( this ).autocomplete( "instance" ).menu.active ) {
                event.preventDefault();
            }
            name = document.querySelector("span[class*='name-autocomplete'][data-id='"+ event.target.dataset.id +"']");
            input = document.querySelector("input[class*='name-autocomplete-input'][data-id='"+ event.target.dataset.id +"']");
            if (event.key === "Enter") {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'update/' + event.target.dataset.id +'?name='+ event.target.value);
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        //xhr.responseText
                        name.innerHTML = JSON.parse(xhr.responseText).pkm_name;
                    }
                };
                xhr.send();
                input.hidden = !input.hidden;
                name.hidden = !name.hidden;
            }
        })
        .autocomplete({
            minLength: 0,
            source: function( request, response ) {
                // delegate back to autocomplete, but extract the last term
                var getpkms = $.getJSON('/autocomplete', {query:request.term}, function(data){
                    let newData = [];
                    data.forEach(function(n,i){
                        newData.push(n.original);
                    });
                    response(newData);
                })
            },
            focus: function() {
                // prevent value inserted on focus
                return false;
            },
            select: function( event, ui ) {
                var terms = [this.value];
                // remove the current input
                terms.pop();
                // add the selected item
                terms.push( ui.item.value );

                this.value = terms;
                return false;
            }
        });
});
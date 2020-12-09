$( document ).ready(function() {

    addSearchByPeriod();
    addAdminElements();
    $('body').append(`<div id="events-container"></div>`);
    myAjax('getAllEvents',{},(data)=>{
        $.each(data,(index,row)=>{
            console.log(row['DateEvenement'] + row['LieuEvenement']);
            
        });
    });

});

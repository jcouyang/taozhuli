var taobaoURL = "https://eco.taobao.com/router/rest";
var sufParam='&format=json&v=2.0&callback=?';
var access_token=null;
var company=null;
var client_id = '12643303';
var authurl = 'https://oauth.taobao.com/authorize?response_type=code&client_id='+client_id+'&redirect_uri=urn:ietf:wg:oauth:2.0:oob&state=1212&scope=item&view=wap'
//
//$( document ).bind( "mobileinit", function() {
//                   // Make your jQuery Mobile framework configuration changes here!
//                   
//                   $.mobile.allowCrossDomainPages = true;
//                   });
var serviceURL = 'http://huanduoduo.com/taobao/'
//var serviceURL = 'http://127.0.0.1:8000/taobao/'


function updatePostFee(event){
  event.preventDefault();
  token=localStorage.getItem("token");
  console.log('form not submit');
  $this=$(this);
  var formData = $this.serialize();
  console.log($this);
  $.getJSON('https://eco.taobao.com/router/rest',formData+'&method=taobao.trade.postage.update&access_token='+token+'&format=json&v=2.0&callback=?',function(data){
    console.log(data.error_response);
    if(data.error_response){
      $('#error_dialog').find('h2').text(data.error_response.sub_msg);
      $.mobile.changePage("#error_dialog",
                          {
                            role:'dialog',
                            transition: "pop"
                          })
    }else{
      // Console.log($this.find('input[name="tid"]').val());
      var tid = $this.find('input[name="tid"]').val();
      var response=data.trade_postage_update_response.trade
      $('#payment_and_post'+tid).text('实付款:'+response.payment+' 运费:'+response.post_fee);
      $('#payment'+tid).text(response.payment);
      $.mobile.changePage("#change_postfee_ok",
                          {
                            role:'dialog',
                            transition: "pop"
                          })
    };
  });
  return false;
};
function logout(){
//    localStorage.clear();
    //    alert('logout');
    var cb = window.plugins.childBrowser;
    
    if(cb != null) {
        cb.showWebPage("http://google.com");
    
    
}
function checkauth($this){

    src=$this.attr('src');
    console.log('src',src);
    console.log('iframe',$('#tblogin > iframe > html').find('.box-bd p').text());
    if($.inArray('agreement=true',src.split('&'))){
        console.log($('#tblogin > iframe > html').find('.box-bd p').text());
        console.log($this.find('.box-bd p').text());
    }
}

function requestToken(){
    var event = 'onload="checkauth($(this))"';
    var html = '<iframe src="'+authurl+'" width="100%" '+event+' height="600px"><p>Your browser does not support iframes.</p></iframe>'
    $tblogin=$('#tblogin').html(html);
    $.mobile.changePage('#login');
//  $.getJSON(serviceURL+ 'get_accesstoken', 'callback=?',function(data) {
//    if (!data.token)
//      window.location='http://huanduoduo.com/login/taobao/';
//    localStorage.setItem("token",data.token);
//    access_token=data.token
//    console.log(access_token);
//    getSoldList();
//  });
    
}
function getSoldList() {

  $.getJSON('https://eco.taobao.com/router/rest','method=taobao.trades.sold.get&access_token='+getToken()+'&format=json&v=2.0&fields=seller_nick,buyer_nick,title, type, created, tid, seller_rate, buyer_rate, status, payment, discount_fee, adjust_fee, post_fee, total_fee, pay_time, end_time, modified, consign_time, buyer_obtain_point_fee, point_fee, real_point_fee, received_payment, commission_fee, pic_path, num_iid, num, price, cod_fee, cod_status, shipping_type, receiver_name, receiver_state, receiver_city, receiver_district, receiver_address, receiver_zip, receiver_mobile, receiver_phone,seller_flag,alipay_id,alipay_no,is_lgtype,is_force_wlb,is_brand_sale,buyer_area,has_buyer_message,orders&callback=?',function(data){
    //        console.log('getsoldlist',data);
    if(data.error_response) requestToken();
    $('#sold_items_list li').remove();
    sold_items = data.trades_sold_get_response.trades.trade;
    
    $.each(sold_items, function(index, item) {
      
      $('#sold_item_template').tmpl(item).appendTo('#sold_items_list');
      $("#detail_page_template").tmpl(item).appendTo('body');
      
      $('#detail_order_template').tmpl(item.orders.order).appendTo('#tid'+item.tid+' section.order.order_list > ul');
    });//end function(index,item)
    $('#sold_items_list').listview('refresh');
    $('.form_postfee').submit(updatePostFee);
    getCompany();
    $( '#sold_items_list' ).find('li').bind('click',function(event){
      token=localStorage.getItem("token");
      var href =  $(this).attr('ref');
      console.log(href);
      var tid=href.substring(4,href.length);
      console.log("tid",tid);
      $.getJSON('https://eco.taobao.com/router/rest','tid='+tid+'&fields=trades.buyer_memo&method=taobao.trade.get&access_token='+token+'&format=json&v=2.0&callback=?',function(data){
        
        if(data.error_response){
          $('#error_dialog').find('h2').text(data.error_response.sub_msg||data.error_response.msg);
          $.mobile.changePage("#error_dialog",
                              {
                                role:'dialog',
                                transition: "pop"
                              })
          return false;
        }else{
          if(data.trade_get_response.trade.buyer_memo)
            $('#memo'+tid).text(data.trade_get_response.trade.buyer_memo);
          else
            $('#memo'+tid).text('无');
        };
      });
    });
    
    //end each()
  })
};


function getToken(){
  if(access_token)
    return access_token;
  else{
    var token= localStorage.getItem("token");
    if (token)return localStorage.getItem("token");
    else{
      requestToken();
      return false;}}
};
function getCompany(){
  if(company)return company;
  else
    $.getJSON(taobaoURL,'method=taobao.logistics.companies.get&fields=id,code,name,reg_mail_no&access_token='+getToken()+sufParam,function(data){
      
      company=data.logistics_companies_get_response.logistics_companies.logistics_company
      
    });
};



function   scan(){
  window.plugins.barcodeScanner.scan(
    function(result) {
      console.log(result);
      if (result.cancelled)
        // navigator.notification.alert("the user cancelled the
        // scan")
        console.log('user cancel');
      else
        navigator.notification.confirm(
          '请确认单号是否正确:\n'+result.text,  // mes'sage
          function confirmscan(button){
            if(button==1){
              $('#send_goods form input[name="out_sid"]').val(result.text);
                                        $.mobile.changePage('#send_goods',{role:'dialog'});
            }
            else{
              scan();
            }
          },       // callback to invoke with index of button pressed
          '扫描成功',            // title
          '确定,重新扫描'          // buttonLabels
        );

    },
    function(error) {
      alert("scanning failed: " + error)
    }
  );

}
$( '#home' ).live( 'pageinit',function(event){
  console.log('init');
  if (getToken)
    getSoldList();
  
  //when the send goods btn clicked
  $('.btn_send_goods').live('click',function(){
                            
    
           $('#send_goods form input[name="tid"]').val($(this).attr("name"))
           var company=getCompany()
           console.log( company);
           var select = $('#form_send_goods select');
           select.empty();
           $.each(company,function(index,item){
               select.append(
                   '<option  value="'+item.code+'" >'+item.name+'</option>'
               )});
                            scan();
  });
  $('#form_send_goods').submit(function(event){
    event.preventDefault();
    token=localStorage.getItem("token");
    console.log('form not submit');
    var formData = $(this).serialize();
    $.getJSON('https://eco.taobao.com/router/rest',formData+'&method=taobao.logistics.offline.send&access_token='+token+'&format=json&v=2.0&callback=?',function(data){
      console.log(data.error_response);
      if(data.error_response){
        $('#error_dialog').find('h2').text(data.error_response.sub_msg||data.error_response.msg);
        $.mobile.changePage("#error_dialog",
                            {
                              role:'dialog',
                              transition: "pop"
                            })
      }else{
        $.mobile.changePage("#error_dialog",
                            {
                              role:'dialog',
                              transition: "pop"
                            })
      };
    });
    return false;
  });
  // $('#buck_action').bind('click',function(){
  
});




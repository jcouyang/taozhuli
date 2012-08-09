// real
taobaoURL = "https://eco.taobao.com/router/rest";
// Sandbox
// taobaoURL ='http://gw.api.tbsandbox.com/router/rest';
// authURL = 'https://oauth.tbsandbox.com/authorize';

sufParam='&format=json&v=2.0&callback=?';
// serviceURL = 'http://huanduoduo.com/taobao/'
// loginURL = 'http://huanduoduo.com/login/taobao/'
serviceURL = 'http://127.0.0.1:8000/taobao/'
loginURL = 'http://127.0.0.1:8000/login/taobao/'
var access_token=null;
var company=null;
client_id = '12633133';
// var authurl = 'https://oauth.taobao.com/authorize?response_type=code&client_id='+client_id+'&redirect_uri=urn:ietf:wg:oauth:2.0:oob&state=1212&scope=item&view=wap';
//
//$( document ).bind( "mobileinit", function() {
//                   // Make your jQuery Mobile framework configuration changes here!
//                   
//                   $.mobile.allowCrossDomainPages = true;
//                   });

//var serviceURL = 'http://127.0.0.1:8000/taobao/'
var status_msg={
  'TRADE_NO_CREATE_PAY':'没有创建支付宝交易',
  'WAIT_BUYER_PAY':'等待买家付款',
  'WAIT_SELLER_SEND_GOODS':'等待卖家发货,即:买家已付款',
  'WAIT_BUYER_CONFIRM_GOODS':'等待买家确认收货,即:卖家已发货',
  'TRADE_BUYER_SIGNED':'买家已签收',
  'TRADE_FINISHED':'交易成功',
  'TRADE_CLOSED':'交易关闭',
  'TRADE_CLOSED_BY_TAOBAO':'交易被淘宝关闭'
}

function locationChange(loc) {
  console.log("location change",loc);
  if(loc=="http://geogeo.github.com/taozhuli/"){
    window.plugins.childBrowser.close();
    refresh();}
}

function updatePostFee(event){
  event.preventDefault();
  token=localStorage.getItem("token");
  console.log('form not submit');
  $this=$(this);
  var formData = $this.serialize();
  console.log($this);
  $.getJSON(taobaoURL,formData+'&method=taobao.trade.postage.update&access_token='+token+'&format=json&v=2.0&callback=?',function(data){
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
  localStorage.removeItem("token")
  // var logoutwin= window.open("http://huanduoduo.com/account/logout",'登出', 'width=400,height=600,scrollbars=yes');
  //  logoutwin.onload=self.close();
  var cb = window.plugins.childBrowser;
  if(cb){
    cb.showWebPage(loginURL);
    cb.onLocationChange = function(loc){locationChange(loc);};
  }
  else{ 
var loginwin= window.showModalDialog(loginURL,'登入', 'width=400,height=600,scrollbars=yes');
      // loginwin.onunload =function(){console.log('close');}
      console.log('close');
      refresh()
      }
}

function requestToken(){
  
  $.getJSON(serviceURL+ 'get_accesstoken', 'callback=?',function(data) {
    if (!data.token){
      var cb = window.plugins.childBrowser;
      if(cb){
        cb.showWebPage(loginURL);
        cb.onLocationChange = function(loc){locationChange(loc);};
      }
      else{ 
        var loginwin= window.showModalDialog(loginURL,'登入', 'width=400,height=600,scrollbars=yes');
            // loginwin.showModalDialog =function(){console.log('close');}
        refresh();
      }
    }else{
      localStorage.setItem("token",data.token);
      access_token=data.token
      console.log(access_token);
      getSoldList();
    }
  });
  
}
function getSoldList() {
  console.log('geting list');
  $.getJSON(taobaoURL,'method=taobao.trades.sold.get&access_token='+getToken()+'&format=json&v=2.0&fields=buyer_nick,title,created, tid, status, payment, discount_fee, adjust_fee, post_fee, total_fee, pay_time, end_time, consign_time, received_payment, pic_path, num, price, cod_fee, cod_status, shipping_type, receiver_name, receiver_state, receiver_city, receiver_district, receiver_address, receiver_zip, receiver_mobile, receiver_phone,alipay_id,alipay_no,has_buyer_message,orders&callback=?',function(data){
    //        console.log('getsoldlist',data);
    
    if(data.error_response||!data.trades_sold_get_response) 
    {
      requestToken();
      return;
    }
    var sold_items=data.trades_sold_get_response.trades.trade;
    $('#sold_items_list li').remove();
    //    sold_items = data.trades_sold_get_response.trades.trade;
    $('.order-detail').remove();
    $.each(sold_items, function(index, item) {
        console.log(item);
      item.status = status_msg[item.status]
      $('#sold_item_template').tmpl(item).appendTo('#sold_items_list');
      $("#detail_page_template").tmpl(item).appendTo('body');
      
      $('#detail_order_template').tmpl(item.orders.order).appendTo('#tid'+item.tid+' section.order.order_list > ul');
    });//end function(index,item)
    
    $('#sold_items_list').listview('refresh');
    $('.form_postfee').submit(updatePostFee);
    $('.order-detail').bind('pageshow',function(){
      token=localStorage.getItem("token");
      var href =  $(this).attr('id');
      var tid=href.substring(3,href.length);
        if(1){
      $.getJSON(taobaoURL,'tid='+tid+'&fields=trades.buyer_memo&method=taobao.trade.get&access_token='+token+'&format=json&v=2.0&callback=?',function(data){
        
        if(data.error_response){
          $('#error_dialog').find('h2').text(data.error_response.sub_msg||data.error_response.msg);
          $.mobile.changePage('#home');
          $.mobile.changePage("#error_dialog",
                              {
                                role:'dialog',
                                transition: "pop"
                              })
        }else{
          if(data.trade_get_response.trade.buyer_memo)
            $('#memo'+tid).text(data.trade_get_response.trade.buyer_memo);
          else
            $('#memo'+tid).text('无');
        };
      });
        }//end get memo

    }
                           )
    console.log('getting company'
               )
    getCompany();
    $.mobile.hidePageLoadingMsg();
    // $( '#sold_items_list' ).find('li').bind('click',function(event){
    
    // });
    
    //end getJOSN()
  })

};

function refresh(){
  $.mobile.showPageLoadingMsg();
  getSoldList();
  // console.log('refreshed');
}
function getToken(){
  if(access_token)
    return access_token;
  else{
    var token= localStorage.getItem("token");
    return localStorage.getItem("token");
    // else{
    //   requestToken();
    //   return false;}
  }
};
function getCompany(){
  if(company)return company;
  else
    $.getJSON(taobaoURL,'method=taobao.logistics.companies.get&fields=id,code,name,reg_mail_no&access_token='+getToken()+sufParam,function(data){
      
      company=data.logistics_companies_get_response.logistics_companies.logistics_company
      
    });
};

function scan(){
  window.plugins.barcodeScanner.scan(
    function(result) {
      console.log(result);
      if (result.cancelled)
        // navigator.notification.alert("the user cancelled the
        // scan")
        $.mobile.changePage('#send_goods',{role:'dialog'});
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
function filter(){
  $.mobile.changePage("#home");
  $('input[data-type="search"]').val("等待卖家发货").trigger("change");
}
function clearfilter(){
  $.mobile.changePage("#home");
  console.log('clear fileter');
  $('input[data-type="search"]').val("").trigger("change");
}
$( '#home' ).live('pagebeforecreate',
                  function(){
                    console.log('before');
                    $.mobile.showPageLoadingMsg();
                    setTimeout($.mobile.showPageLoadingMsg, 2);
                  }
                 )

  .live( 'pageinit',function(event){
    console.log('init');

    if (getToken){       
      getSoldList();
    }
    
    $('.free-delivery').live('click',function(){
      $(this).closest('input[name=post_fee]').val("0")
        .closest('form').submit();
    })


    //when the send goods btn clicked
    $('.btn_send_goods').live('click',function(){
      $('#send_goods form input[name="tid"]').val($(this).attr("name"))
      var select = $('#form_send_goods select');
      if (!select.find('option').length){
        var company=getCompany()
        console.log( company);
        
        // select.empty();
        $.each(company,function(index,item){
          select.append(
            '<option  value="'+item.code+'" >'+item.name+'</option>'
          )});
      }
      
      if( window.plugins.barcodeScanner)
        scan();
      else
        $.mobile.changePage('#send_goods',{role:'dialog'});
    });
    $('#form_send_goods').submit(function(event){
      event.preventDefault();
      token=localStorage.getItem("token");
      
      var formData = $(this).serialize();
      console.log('form will submit',formData);
      // $.getJSON('https://eco.taobao.com/router/rest',formData+'&method=taobao.logistics.offline.send&access_token='+token+'&format=json&v=2.0&callback=?',function(data){
        // console.log('sendgood',data);
      //   if(data.error_response){
      //     $('#error_dialog').find('h2').text(data.error_response.sub_msg||data.error_response.msg);
      //   }
      //     $.mobile.changePage("#error_dialog",
      //                         {
      //                           role:'dialog',
      //                           transition: "pop"
      //                         })
      // });
      return false;
    });
    // $('#buck_action').bind('click',function(){
  });

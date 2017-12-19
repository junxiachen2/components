var adPicker = [];
adPicker.dict = [];        //省市区字典
adPicker.streetDict = [];  //街道字典
adPicker.curAd = [];       //目前省市区街道
adPicker.addStr = '';
var adPickerArr = [
    "北京市",
    "上海市",
    "天津市",
    "重庆市",
    "河北省",
    "山西省",
    "河南省",
    "辽宁省",
    "吉林省",
    "黑龙江省",
    "内蒙古自治区",
    "江苏省",
    "山东省",
    "安徽省",
    "浙江省",
    "福建省",
    "湖北省",
    "湖南省",
    "广东省",
    "广西壮族自治区",
    "江西省",
    "四川省",
    "海南省",
    "贵州省",
    "云南省",
    "西藏自治区",
    "陕西省",
    "甘肃省",
    "青海省",
    "宁夏回族自治区",
    "新疆维吾尔自治区"
]
getData()
eventListeners()

function fiterArr(array) {
    var objArr = []
    for (var i = 0; i < adPickerArr.length; i++) {
        var item = adPickerArr[i]
        for (var j = 0; j < array.length; j++) {
            var pro = array[j]
            if (pro.name == item) {
                objArr.push(pro)
            }
        }
    }
    // console.log(objArr);
    return objArr
}
function getData() {
    $.ajax({
        url: '//restapi.amap.com/v3/config/district?key=758422711ba8022bc0629aab87ee3847&subdistrict=3',
        type: 'get',
        success: function (data) {
            if ('OK' != data.info) return;
            console.log(data.districts[0].districts)
            adPicker.dict = fiterArr(data.districts[0].districts)

            renderAdPickerContentBox();
        }
    });
}

function preSaveAddress() {
    var pid = adPicker.curAd[0];
    var cid = adPicker.curAd[1];
    var did = adPicker.curAd[2];
    var sid = adPicker.curAd[3];

    var province = adPicker.dict[pid];
    var city = province.districts[cid];

    adPicker.addStr = province.name + city.name;
    if (did == 100) {
        adPicker.addStr += '';
    } else {
        adPicker.addStr += city.districts[did].name;
    }
    if (sid == 100) {
        adPicker.addStr += '';
    } else {
        adPicker.addStr += adPicker.streetDict[sid].name;
    }
    console.log(adPicker.addStr)
    $('#adText').text(adPicker.addStr)
    $('#adPicker').hide();
    $("#addAddressPage .districtSpan").text(adPicker.addStr)
}

function renderAdPickerContentBox() {

    var $contentBox = $('#contentBox');
    $contentBox.empty();
    $contentBox.scrollTop(0);

    var pid = adPicker.curAd[0];
    var cid = adPicker.curAd[1];
    var did = adPicker.curAd[2];

    if (adPicker.curAd[2]) {
        if (adPicker.curAd[2] == 100) {
            $contentBox.append('<div class="boxItem" data-sid="100">其他</div>')
            return
        }
        var adcode = adPicker.dict[pid].districts[cid].districts[did].adcode;
        $.ajax({
            url: '//restapi.amap.com/v3/config/district?key=758422711ba8022bc0629aab87ee3847&subdistrict=1&keywords=' + adcode,
            type: 'get',
            success: function (data) {
                if ('OK' != data.info) return;
                adPicker.streetDict = data.districts[0].districts;
                for (var i in adPicker.streetDict) {
                    $contentBox.append('<div class="boxItem" data-sid="' + i + '">' + adPicker.streetDict[i].name + '</div>')
                }
                $contentBox.append('<div class="boxItem" data-sid="100">其他</div>')
            }
        });
    } else if (adPicker.curAd[1]) {
        var arr = adPicker.dict[pid].districts[cid].districts;
        var i;
        for (var i in arr) {
            $contentBox.append('<div class="boxItem" data-did="' + i + '">' + arr[i].name + '</div>')
        }
        $contentBox.append('<div class="boxItem" data-did="100">其他</div>')
    } else if (adPicker.curAd[0]) {
        var arr = adPicker.dict[pid].districts;
        for (var i in arr) {
            $contentBox.append('<div class="boxItem" data-cid="' + i + '">' + arr[i].name + '</div>')
        }
    } else {
        // 过滤港澳台
        for (var i in adPicker.dict) {
            $contentBox.append('<div class="boxItem" data-pid="' + i + '">' + adPicker.dict[i].name + '</div>')
        }
    }
}

function renderAdPickerTabName() {
    var pid = adPicker.curAd[0];
    var cid = adPicker.curAd[1];
    var did = adPicker.curAd[2];
    var sid = adPicker.curAd[3];

    if (pid) {
        $('#tab1').text(adPicker.dict[pid].name);
    }
    if (cid) {
        $('#tab2').text(adPicker.dict[pid].districts[cid].name);
    }
    if (did) {
        $('#tab3').text(did == 100 ? '其他' : adPicker.dict[pid].districts[cid].districts[did].name);
    }
    if (sid) {
        $('#tab4').text(sid == 100 ? '其他' : adPicker.streetDict[sid].name);
    }
}

function eventListeners() {
    $('#adPicker').on('click', '.boxItem', function () {

        var pid = $(this).attr('data-pid');
        var cid = $(this).attr('data-cid');
        var did = $(this).attr('data-did');
        var sid = $(this).attr('data-sid');

        if (sid) {
            adPicker.curAd[3] = sid;
            preSaveAddress()
        } else if (did) {
            adPicker.curAd[2] = did;
            adPicker.curAd[3] = undefined;
            setTabStatus(4)
        } else if (cid) {
            adPicker.curAd[1] = cid;
            adPicker.curAd[2] = undefined;
            adPicker.curAd[3] = undefined;
            setTabStatus(3)
        } else if (pid) {
            adPicker.curAd[0] = pid;
            adPicker.curAd[1] = undefined;
            adPicker.curAd[2] = undefined;
            adPicker.curAd[3] = undefined;
            setTabStatus(2)
        }
    })

    $('#adPicker').on('click', '.close-btn', function () {
        $('#adPicker').hide();
    })
    $('#adPicker').on('click', '.tab', function () {
        setTabStatus($(this).attr('data-i'))
    })
}

function setTabStatus(tabNo) {
    $('.tab').removeClass('current');
    $('.tab').hide();
    if (tabNo == 1) {
        adPicker.curAd[0] = undefined;
        adPicker.curAd[1] = undefined;
        adPicker.curAd[2] = undefined;
        adPicker.curAd[3] = undefined;
        $('#tab1').addClass('current');
        $('#tab1').show();
        $('#tab1').text('请选择');
    } else if (tabNo == 2) {
        adPicker.curAd[1] = undefined;
        adPicker.curAd[2] = undefined;
        adPicker.curAd[3] = undefined;
        $('#tab2').addClass('current');
        $('#tab1,#tab2').show();
        $('#tab2').text('请选择');
    } else if (tabNo == 3) {
        adPicker.curAd[2] = undefined;
        adPicker.curAd[3] = undefined;
        $('#tab3').addClass('current');
        $('#tab1,#tab2,#tab3').show();
        $('#tab3').text('请选择');
    } else if (tabNo == 4) {
        adPicker.curAd[3] = undefined;
        $('#tab4').addClass('current');
        $('#tab1,#tab2,#tab3,#tab4').show();
        $('#tab4').text('请选择');
    }

    renderAdPickerTabName();
    renderAdPickerContentBox();
}

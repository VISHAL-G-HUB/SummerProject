const w2 = 0.3, w3 = 1.20, lcv = 3.0, bus = 4.5;
var flowASL, flowASR //buttom side
var flowBSR, flowBSL //top side
var flowCSU, flowCSD //left side
var flowDSD, flowDSU //right side
var headway, lt; //headway and lost time
var target = document.querySelectorAll('input');
//target[i]--- i-th child
for (let i = 0; i < 32; i++) {
    target[i].value = (i % 7 + 1) * 30;    //set default values here
}

var setf; //saturation flow
var tota, totb, totc, totd; //total flow on each side
var arr = [2, 2, 2, 2];
var tot = [0, 0, 0, 0];
var delay = [0, 0, 0, 0];
var total;
var cra, crb, crc, crd;
var co, ga, gb, gc, gd, ratio; //co=cycle time, ga,gb,gc,gd is green interval for each respactive direction
var date=Date();
var myVar; //used for set interval 
const submitResult = async () => {
    
   
    var v= {
    "Location":document.getElementById("in").value,
    "Date":date,
    "w2al":target[0].value,
     "w3al":target[1].value,
     "lcval":target[2].value,
     "busal":target[3].value,
     "w2ar":target[16].value,
     "w3ar":target[17].value,
     "lcvar":target[18].value,
     "busar":target[19].value,
     "w2bl":target[20].value,
     "w3bl":target[21].value,
     "lcvbl":target[22].value,
     "busbl":target[23].value,
     "w2br":target[4].value,
     "w3br":target[5].value,
     "lcvbr":target[6].value,
     "busbr":target[7].value,
     "w2cu":target[8].value,
     "w3cu":target[9].value,
     "lcvcu":target[10].value,
     "buscu":target[11].value,
     "w2cd":target[24].value,
     "w3cd":target[25].value,
     "lcvcd":target[26].value,
     "buscd":target[27].value,
     "w2du":target[28].value,
     "w3du":target[29].value,
     "lcvdu":target[30].value,
     "busdu":target[31].value,
     "w2dd":target[12].value,
     "w3dd":target[13].value,
     "lcvdd":target[14].value,
     "busdd":target[15].value,
    };
    console.log(JSON.stringify(v));
    try {
      const response = await fetch('https://dry-lake-43219.herokuapp.com/posts/send', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(v),
      });

      const data = await response.json();
       console.log(data);
   
    } catch (e)
     {console.log(e);
    }
  };
function calculate() {
    flowASL = w2 * target[0].value + w3 * target[1].value + lcv * target[2].value + bus * target[3].value;
    flowASR = w2 * target[16].value + w3 * target[17].value + lcv * target[18].value + bus * target[19].value;
    flowBSL = w2 * target[20].value + w3 * target[21].value + lcv * target[22].value + bus * target[23].value;
    flowBSR = w2 * target[4].value + w3 * target[5].value + lcv * target[6].value + bus * target[7].value;
    flowCSU = w2 * target[8].value + w3 * target[9].value + lcv * target[10].value + bus * target[11].value;
    flowCSD = w2 * target[24].value + w3 * target[25].value + lcv * target[26].value + bus * target[27].value;
    flowDSU = w2 * target[28].value + w3 * target[29].value + lcv * target[30].value + bus * target[31].value;
    flowDSD = w2 * target[12].value + w3 * target[13].value + lcv * target[14].value + bus * target[15].value;
    headway = document.getElementById("h").value;
    lt = document.getElementById("lost").value;

    setf = 3600 / headway;  //saturation flow (vph)
    tot[0] = tota = flowASL + flowASR;
    tot[1] = totb = flowBSL + flowBSR;
    tot[2] = totc = flowCSU + flowCSD;
    tot[3] = totd = flowDSU + flowDSD;

    for (let i = 0; i < 4; i++) arr[i] = 2;
    total = tota + totb + totc + totd;
    while (total / setf >= 1) //Green splitting
    {
        let pos = -1, val = 0;
        for (let i = 0; i < 4; i++) {
            if (tot[i] > val) {
                val = tot[i];
                pos = i;
            }
        }
        tot[pos] = tot[pos] / arr[pos];
        arr[pos]++;
        total = tot[0] + tot[1] + tot[2] + tot[3];
    }

    cra = tot[0] / setf;
    crb = tot[1] / setf;
    crc = tot[2] / setf;
    crd = tot[3] / setf;

    ratio = total / setf;
    co = (1.5 * lt + 5) / (1 - ratio);
    ga = (cra / ratio) * (co - lt);
    gb = (crb / ratio) * (co - lt);
    gc = (crc / ratio) * (co - lt);
    gd = (crd / ratio) * (co - lt);

    ga = Math.round(ga);
    gb = Math.round(gb);
    gc = Math.round(gc);
    gd = Math.round(gd);

    var len = target.length;
    target[len - 8].value = ga + " sec"; //green time
    target[len - 7].value = gb + " sec";
    target[len - 6].value = gc + " sec";
    target[len - 5].value = gd + " sec";

    for (let i = 0; i < 4; i++) target[len - 12 + i].value = Math.round(tot[i]) + " veh/hr"; //flow

    // var cc =[setf*ga/co,setf*gb/co,setf*gc/co,setf*gd/co];
    delay[0] = (co * (1 - ga / co) * (1 - ga / co)) / (2 * (1 - tot[0] / setf));
    delay[1] = (co * (1 - gb / co) * (1 - gb / co)) / (2 * (1 - tot[1] / setf));
    delay[2] = (co * (1 - gc / co) * (1 - gc / co)) / (2 * (1 - tot[2] / setf));
    delay[3] = (co * (1 - gd / co) * (1 - gd / co)) / (2 * (1 - tot[3] / setf));
    for (let i = 0; i < 4; i++) { target[len - 4 + i].value = Math.round(delay[i]) + " sec/veh"; } //delay

    let time = 0;
    myVar = setInterval(() => {
        time++;
        document.getElementById("ta").style.color = "red";
        document.getElementById("tb").style.color = "red";
        document.getElementById("tc").style.color = "red";
        document.getElementById("td").style.color = "red";
        document.getElementById("a").style.backgroundColor = "red";
        document.getElementById("b").style.backgroundColor = "red";
        document.getElementById("c").style.backgroundColor = "red";
        document.getElementById("d").style.backgroundColor = "red";
        if (time > 0 && time <= ga) {
            document.getElementById("ta").value = ga - time;
            document.getElementById("ta").style.color = "green";
            document.getElementById("a").style.backgroundColor = "green";
        }

        if (time > ga && time <= ga + gb) {
            document.getElementById("tb").value = gb + ga - time;
            document.getElementById("tb").style.color = "green";
            document.getElementById("b").style.backgroundColor = "green";
        }

        if (time > ga + gb && time <= ga + gb + gc) {
            document.getElementById("tc").value = gc + ga + gb - time;
            document.getElementById("tc").style.color = "green";
            document.getElementById("c").style.backgroundColor = "green";
        }

        if (time > ga + gb + gc && time <= ga + gb + gc + gd) {
            document.getElementById("td").value = gd + ga + gb + gc - time;
            document.getElementById("td").style.color = "green";
            document.getElementById("d").style.backgroundColor = "green";
        }
        time = time % (ga + gb + gc + gd);
    }, 1000);

}

function stop() {
    document.getElementById("ta").value = 0;
    document.getElementById("tb").value = 0;
    document.getElementById("tc").value = 0;
    document.getElementById("td").value = 0;
    clearInterval(myVar);
}



var target = document.querySelectorAll('input');
for (let i = 0; i < 32; i++) {
    target[i].setAttribute("oninput", "this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\\..*)\\./g, '$1')");
}
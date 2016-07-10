var http =  require('http');
var jsSHA = require('jssha');

const APP_KEY = "23385461";                                 // 这是一个示例 App Key, 你需要向配装器申请自己的 App Key.
const APP_SECRET = "8f9a14c7413d867a8f3f4412d36fc896";      // 这是一个示例 App Secret, 你需要向配装器申请自己的 App Secret.

function sign(stringToSign){
	let shaObj = new jsSHA("SHA-256", "TEXT");
	shaObj.setHMACKey(APP_SECRET, "TEXT");
	shaObj.update(stringToSign);
	let hmac = shaObj.getHMAC("B64");
	return hmac;
}

function sendRequest(){
	var timestamp = (new Date()).valueOf(); 
	// 构造用于签名的字符串
	var httpMethod = "GET";
	var accept = "application/json";
	var contentMd5 = "";
	var contentType = "";
	var date = "";
	// Headers 需要按字典顺序进行排序
	var headers = "X-Ca-Key:" + APP_KEY + "\n" +
	"X-Ca-Stage:release\n" +
	"X-Ca-Timestamp:" + timestamp + "\n" +
	"X-Ca-Version:1" + "\n";
	// host 不用于签名，只需要将 Path 和 Query 部分加入签名即可
	var host = "api.j3pz.com";
	var uri = "/search?keyword=紫萝怨&position=b";

	var stringToSign = httpMethod + "\n" +
	accept + "\n" +
	contentMd5 + "\n" +
	contentType + "\n" +
	date + "\n" +
	headers +
	uri;

	uri = encodeURI(uri);// 如果需要对 url 进行编码，请在构造签名字符串之后再进行此操作

	// 使用 HMAC 进行签名
	var signature = sign(stringToSign);
	var options = {
		hostname: host,
		path: uri,
		method: 'GET',
		headers: {
			"X-Ca-Version": "1",		//API版本
			"X-Ca-Signature-Headers":  "X-Ca-Version,X-Ca-Key,X-Ca-Stage,X-Ca-Timestamp",	//参与签名的 Header
			"X-Ca-Key": APP_KEY,		//AppKey
			"X-Ca-Stage": "release",	//Stage
			"X-Ca-Timestamp": timestamp,	//时间戳
			"X-Ca-Signature": signature,	//签名
			"Accept": accept
		}
	};
	console.log(options);

	var req = http.request(options, function(res){
		// 若请求失败，返回的 header 中会带有 x-ca-error-message 字段
		if(res.headers['x-ca-error-message']){
			console.log(res.headers['x-ca-error-message']);
		}else{
			let response = "";
			res.setEncoding('utf8');
			res.on('data', function(chunk){
				response += chunk;
			});
			res.on('end', function(){
				let object = JSON.parse(response)
				console.dir(object, {depth: null, colors: true})
			})
		}
	});

	req.end();
}

sendRequest();

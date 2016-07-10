# 剑网3 配装器 API 示例
##Headers

在调用 API 时，除了各 API 所要求的 Query，Path 参数外，应用应当在请求中同时附带下表中列出的 Header 参数。

| 参数名| 必需| 说明| 示例|
| ----- |:---:| ---:|----:|
| X-Ca-Key| 是| AppKey| 23385461
| X-Ca-Version| 否| API 版本号| 1
| X-Ca-Signature| 是| 签名字符串| 
| X-Ca-Signature-Headers| 是| 参与签名的 Headers| X-Ca-Version,X-Ca-Key,X-Ca-Timestamp
| X-Ca-Timestamp| 否| API 调用者传递时间戳，可选，15 分钟内有效| 1465810658626
| X-Ca-Nonce| 否| API 调用者生成 UUID，结合时间戳进行防重放，可选| 
| Content-MD5| 否| 计算 Body 的 MD5 值传递给网关进行 Body MD5 校验，可选| 

##组织参与签名计算的字符串

首先，应用需要构造参与签名的字符串。将 HTTPMethod，Accept，Content-MD5，Content-Type，Date，Headers 和 URI 用 \n 组合在一起，构成字符串。可参考下边代码示例。

HTTPMethod 为全大写 Accept、Content-MD5、Content-Type、Date 如果为空也需要添加换行符 \n，Headers 如果为空不需要添加 \n，不为空的 Headers 中包含了 \n，详见下面组织 Headers 的描述。URI 为 Path 和 Query 的

```javascript
var stringToSign = 
    HTTPMethod + "\n" + 
    Accept + "\n" + 
    Content-MD5 + "\n" 
    Content-Type + "\n" + 
    DateTime + "\n" + 
    Headers + 
    Url;
```

##组织 Headers

Headers 指所有参与签名计算的 Header 的 Key、Value，这里要注意参与签名计算的 Header 是不包含 X-Ca-Signature、X-Ca-Signature-Headers 的。

先对所有参与签名计算的 Header 的 Key 按照字典排序，然后按照如下方式拼接：

```javascript
headers = HeaderKey1 + ":" + HeaderValue1 + "\n"+ 
    HeaderKey2 + ":" + HeaderValue2 + "\n"+ 
    //... 
    HeaderKeyN + ":" + HeaderValueN + "\n"
```

##URL

Url 指 Path + Query + Body 中 Form 参数，组织方法：对 Query + Form 参数按照字典对 Key 进行排序后按照右侧方法拼接，如果 Query 或 Form 参数为空，则 Url = Path，不需要添加 "?"

需要注意的是，如果参数中存在中文，且有进行 url encoding 的必要的话，需要先对含有中文的 url 进行签名后，再对 url 进行 encoding。
注意这里 Query 或 Form 参数的 Value 可能有多个，多个的时候只取第一个 Value 参与签名计算。

```javascript
url = Path +
    "?" +
    Key1 + "=" + Value1 +
    "&" + Key2 + "=" + Value2 +
    //...
    "&" + KeyN + "=" + ValueN
```

##签名
使用 HMAC-SHA256 算法对构造好的字符串进行签名，签名密钥为 AppSecret，并将结果输出为 Base64 编码格式。

将计算的签名放到请求的 Header 中，Key 为：X-Ca-Signature。将所有参与加签的 Header 的 Key 使用英文逗号分割放到请求的 Header 中，不必区分顺序，Key 为：X-Ca-Signature-Headers。

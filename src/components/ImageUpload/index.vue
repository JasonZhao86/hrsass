<template>
  <div>
    <el-upload
      :on-preview="preview"
      :on-remove="handleRemove"
      :on-change="changeFile"
      :before-upload="beforeUpload"
      :file-list="fileList"
      :http-request="upload"
      list-type="picture-card"
      :limit="1"
      action="#"
      :class="{ disabled: fileComputed }"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <el-progress
      v-if="showPercent"
      style="width: 180px"
      :percentage="percent"
    ></el-progress>
    <!-- 预览弹层 -->
    <el-dialog title="图片" :visible.sync="showDialog">
      <img :src="imgUrl" style="width: 100%" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import COS from "cos-js-sdk-v5";
// 实例化COS对象
const cos = new COS({
  SecretId: "AKIDmO5f7ParvsdAW2TpywmQr35zmPqQwHOI",
  SecretKey: "nUl1BCyUsAICwlU2TikbGhvzsY0a0EWf",
});

export default {
  data() {
    return {
      // 图片地址设置为数组
      fileList: [],
      // 控制显示弹层
      showDialog: false,
      imgUrl: "",
      currentFileUid: null,
      percent: 0,
      showPercent: false,
    };
  },
  methods: {
    preview(file) {
      // 这里应该弹出一个层，层里是点击的图片地址
      this.imgUrl = file.url;
      this.showDialog = true;
    },
    handleRemove(file) {
      // file是点击删除的文件，将原来的文件给排除掉了,剩下的就是最新的数组了
      this.fileList = this.fileList.filter((item) => item.uid !== file.uid);
    },
    /*
      注意该钩子方法会被多次触发，修改文件时会触发，文件上传成功或失败都会触发。因此不能用push，
      file是当前的文件，fileList是当前的最新数组。[] => [...fileList]，[] => fileList.map()
      如果完成上传动作了，第一次文件变更进入和第二次上传成功后进入该方法时，fileList的长度应该都是1，都有数据
    */
    changeFile(file, fileList) {
      // console.log(file, fileList);
      // 上传成功 => 数据才能进来 => 腾讯云cos
      this.fileList = fileList.map((item) => item);
    },
    beforeUpload(file) {
      const types = ["image/jpeg", "image/gif", "image/bmp", "image/png"];
      if (!types.includes(file.type)) {
        this.$message.error("上传图片只能是 JPG、GIF、BMP、PNG 格式!");
        return false;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.$message.error("图片大小最大不能超过5M");
        return false;
      }

      // 已经确定当前上传的就是当前的这个file了
      this.currentFileUid = file.uid;
      this.showPercent = true;
      return true;
    },
    upload(params) {
      // file对象，是我们需要上传到腾讯云服务器的内容
      if (params.file) {
        cos.putObject(
          {
            Bucket: "hrsaas-img-1259817815",
            Region: "ap-nanjing", // 地域
            Key: params.file.name, // 文件名
            Body: params.file, // 要上传的文件对象
            StorageClass: "STANDARD", // 上传的模式类型，默认值标准模式即可
            onProgress: (params) => {
              // 通过腾讯云sdk监听上传进度
              this.percent = params.percent * 100;
            },
          },
          // 上次成功或失败后的回调函数
          (err, data) => {
            console.log(err || data);
            // 上传成功
            if (!err && data.statusCode === 200) {
              /* 
                文件上传成功后要获取成功的返回地址到fileList，这样upload组件就会根据fileList的变化而去渲染视图，
                将上次成功的图片显示到上传组件中，需要将fileList中数据的url地址变成上传成功后的地址，需要知道当
                前上传成功的是哪一张图片。
              */
              this.fileList = this.fileList.map((item) => {
                if (item.uid === this.currentFileUid) {
                  /* 
                    upload为true表示这张图片已经上传完毕，这个属性要为我们后期应用的时候做标记，因为点击保存时，
                    图片有大有小，上传速度有快有慢，要根据有没有upload这个标记来决定是否去保存
                  */
                  return { url: "http://" + data.Location, upload: true };
                }
                return item;
              });
              setTimeout(() => {
                this.showPercent = false;
                this.percent = 0;
              }, 2000);
            }
          }
        );
      }
    },
  },
  computed: {
    // 判断是否已经上传完了一张
    fileComputed() {
      return this.fileList.length === 1;
    },
  },
};
</script>

<style>
.disabled .el-upload--picture-card {
  display: none;
}
</style>

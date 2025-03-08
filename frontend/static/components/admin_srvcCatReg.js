const AdminSrvcCatReg = Vue.component("AdminSrvcCatRegComponent",{
    template:`
    <div class="container-fluid">
    <div class="row vh-100 d-flex justify-content-center align-items-center">
      <!-- Image Section -->
      <div class="col-md-6">
        <div class="AdminSrvcCatRegComponent-image-container">
          <img :src="imageSrc" alt="Illustration" class="AdminSrvcCatRegComponent-img-fluid img-fluid">
        </div>
      </div>
      
      <!--  -->
      <div class="col-md-6">
        <div class="AdminSrvcCatRegComponent-form">
          <div class="AdminSrvcCatRegComponent-logo">
            <i class="fa-solid fa-bell-concierge fa-bounce fa-2xl"></i>
          </div>
          <h2 class="AdminSrvcCatRegComponent-title text-center">Register a Service Category</h2>
          <form @submit.prevent="submitSrvcCat" enctype="multipart/form-data">
            <div class="AdminSrvcCatRegComponent-form-scroll">
            <div class="mb-3">
                <label for="srvc_cat" class="form-label">Service Category Name  <span style="color:red"> * </span></label>
                <input type="text" class="form-control" id="srvc_cat" name="srvc_cat" v-model="formData.srvc_cat" placeholder="Enter service category name" required>
            </div>
            <div class="mb-3">
              <label for="time_req" class="form-label">Minimum Time Required <span style="color:red"> * </span></label>
              <input type="number" min="1" max="4" step="1" class="form-control" id="time_req" name="time_req" v-model="formData.time_req" placeholder="Enter Minimum time required in days" required>
            </div>
            <div class="mb-3">
              <label for="base_price" class="form-label">Base Price <span style="color:red"> * </span></label>
              <input type="number" min="300" step="1" class="form-control" id="base_price" name="base_price" v-model="formData.base_price" placeholder="Enter Base Price in Rupees" required>
            </div>
            <div class="mb-3">
              <label for="srvc_dscp" class="form-label">Service Description <span style="color:red"> * </span></label>
              <textarea class="form-control" id="srvc_dscp" name="srvc_dscp" rows="3" v-model="formData.srvc_dscp" placeholder="Provide Service Description." required></textarea>
            </div> 
            <div class="mb-3">
              <label for="srvc_catImage" lass="form-label">Select a cover Image for this Category  : (accepted : .png)</label>
              <input type="file" class="form-control" id="srvc_catImage" name="srvc_catImage" @change="onFileChange" accept=".png" required>
            </div>
            </div> 
            <button type="submit" class="AdminSrvcCatRegComponent-btn-primary btn-primary btn w-100">Register</button>
          </form>
        </div>
      </div> 
    </div>           
    </div>`,
    data() {
        return {
            imageSrc: "/static/images/servicereg.png",
            formData: {
                base_price: "",
                srvc_dscp: "",
                srvc_cat: "",
                time_req: "",
                srvc_catImage:null
            },
        }
    },
    methods : {
        onFileChange(event) {
          this.formData.srvc_catImage = event.target.files[0];
        },
        async submitSrvcCat() {
            try{
              // const form = new FormData(this.formData);
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                const response = await axios.post(`/api/services`, this.formData,{
                    headers: {
                    "Content-Type": "multipart/form-data",
                    'X-CSRF-Token': csrfToken
                    },
                });
                // console.log(this.formData)
                const data = response.data
                if (response.status != 200) {
                    // const errorData = await response.json();
                    console.error("Error while registering service category. Try again.", data.message);
                    throw new Error(`HTTP Error: ${data.status} - ${data.status}`);
                }
            
                // const data = await data.json();
            
                if (data.status === "success" && data.flag === 1) {
                    console.log("Service Category Registered successfully.")
                    const message = "Service Category Registered successfully.Thank you";
                    const status = "true"
                    this.$router.push(`/redirect/${message}/${status}`);
                    
                }
                else {
                    console.log("Service Category could not be registered.",data.message)
                    const message = "Service Category could not be registered.Please try again later.Thank you";
                    const status = "false"
                    this.$router.push(`/redirect/${message}/${status}`);
                } 
            }
            catch (error) {
                console.error("Error registering.", error.message);
                const message = "Service Category could not be registered.Please try again later.Thank you";
                const status = "false"
                this.$router.push(`/redirect/${message}/${status}`);
            }
        },
    }
})

export default AdminSrvcCatReg;
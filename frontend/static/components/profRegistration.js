const ProfRegistration = Vue.component("ProfRegistrationComponent",{
    template:`
    <div class="container-fluid">
    <div class="row vh-100 d-flex justify-content-center align-items-center">
      <!-- Image Section -->
      <div class="col-md-6">
        <div class="ProfRegistrationComponent-image-container">
          <img :src="imageSrc" alt="Illustration" class="ProfRegistrationComponent-img-fluid img-fluid">
        </div>
      </div>
      
      <!-- Sign Up Form Section -->
      <div class="col-md-6">
        <div class="ProfRegistrationComponent-form">
          <div class="ProfRegistrationComponent-logo">
            <i class="fa-solid fa-bell-concierge fa-bounce fa-2xl"></i>
          </div>
          <h2 class="ProfRegistrationComponent-title text-center">Register as Professional</h2>
          <p v-if="errors.length">
            <b><span style="color:red">Please correct the following error/s:</span></b>
            <ul>
              <li v-for="error in errors"><span style="color:red">{{ error }}</span></li>
            </ul>
          </p>
          <form @submit.prevent="submitProfReg">
            <div class="ProfRegistrationComponent-form-scroll">
              <div class="mb-3">
                <label for="profexp" class="form-label">Years of Experience <span style="color:red"> * </span></label>
                <input type="number" min="0" max="50" step="0.1" class="form-control" id="profexp" name="profexp" v-model="formData.profexp" placeholder="Enter your experience in years" required>
              </div>
              <div class="mb-3">
                  <label for="prof_srvc_name" class="form-label">Enter Service Name  <span style="color:red"> * </span></label>
                  <input type="text" class="form-control" id="prof_srvc_name" name="prof_srvc_name" v-model="formData.prof_srvc_name" placeholder="Enter service name" required>
              </div>
              <div class="mb-3">
                <label for="prof_srvc_cat" class="form-label">Service Category <span style="color:red"> * </span></label>
                <select class="form-select" id="prof_srvc_cat" name="prof_srvc_cat" v-model="formData.prof_srvc_cat" required>
                    <option value="" disabled selected>Select a category</option>
                    <option v-for="(category, index) in service_categories" :key="index" :value="category">
                    {{ category }}
                    </option>
                </select>
              </div>
              <div class="mb-3">
                <label for="profdscp" class="form-label">Tell us more <span style="color:red"> * </span></label>
                <textarea class="form-control" id="profdscp" name="profdscp" rows="3" v-model="formData.profdscp" placeholder="Tell us more about yourself,your qualifications and experience which can help us in judging you." required></textarea>
              </div> 
            </div> 
            <button type="submit" class="ProfRegistrationComponent-btn-primary btn-primary btn w-100">Register</button>
          </form>
        </div>
      </div> 
    </div>           
    </div>`,
    data(){
        return {
            errors: [],
            imageSrc: "/static/images/professional.png",
            formData: {
                profexp: "",
                profdscp: "",
                prof_srvc_cat: "",
                prof_srvc_name: "",
            },
            service_categories: [],
        }
    },
    methods: {
        async fetchServiceCategories(){
            try {
                // const user_id = localStorage.getItem('user_id')
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                // console.log("Here : ",csrfToken)
                const response = await fetch(`/api/srvc_cats`, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    'X-CSRF-Token': csrfToken
                  },
                });
          
                if (!response.ok) {
                  const errorData = await response.json();
                  console.error("Error fetching service categories", errorData.message);
                  throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
                }
          
                const data = await response.json();
          
                if (data.status === "success" && data.flag === 1) {
                  this.service_categories = data.data;
                  
                }
                else {
                    console.error("Failed to fetch services:", data.message);
                }
            } 
            catch (error) {
                console.error("Error fetching services:", error.message);
            }
        },
        async submitProfReg() {
            try{
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                const response = await fetch(`/api/professional`, {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    'X-CSRF-Token': csrfToken
                    },
                    body : JSON.stringify(this.formData)
                });
            
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error while registering professional. Try again.", errorData.message);
                    throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
                }
            
                const data = await response.json();
            
                if (data.status === "success" && data.flag === 1) {
                    console.log("Professional Registration initiated successfully.")
                    localStorage.setItem("prof_req",'1')
                    // Emit an event for Navbar
                    this.$root.$emit('login-success');
                    const message = "Professional Registration initiated successfully.You will be notified once your approval is done.Thank you";
                    const status = "true"
                    this.$router.push(`/redirect/${message}/${status}`);
                    
                }
                else {
                    console.error("Failed to register", data.message);
                    const message = "Professional Registration cound not initiated.Please try again later.Thank you";
                    const status = "false"
                    this.$router.push(`/redirect/${message}/${status}`);
                } 
            }
            catch (error) {
                console.error("Error fetching services:", error.message);
                const message = "Professional Registration cound not initiated.Please try again later.Thank you";
                const status = "false"
                this.$router.push(`/redirect/${message}/${status}`);
            }
        }
    },
    mounted(){
        this.fetchServiceCategories()
    }
})


export default ProfRegistration;
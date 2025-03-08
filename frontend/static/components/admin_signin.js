const AdminSignin = Vue.component("AdminSignin",{
    template : 
    `<div class="container-fluid">
    <div class="row vh-100 d-flex justify-content-center align-items-center">
      <!-- Image Section -->
      <div class="col-md-6">
        <div class="SigninComponent-image-container">
          <img :src="imageSrc" alt="Illustration" class="SigninComponent-img-fluid img-fluid">
        </div>
      </div>
      
      <!-- Login Form Section -->
      <div class="col-md-6">
        <div class="SigninComponent-login-container">
          <div class="SigninComponent-login-box">
            <div class="SigninComponent-login-logo">
              <i class="fa-solid fa-bell-concierge fa-bounce fa-2xl"></i>
            </div>
            <h2 class="text-center">Sign In to Your Account</h2>
            <form @submit.prevent="submitAdminSignin">
              <div class="mb-3">
                <label for="admin_email" class="form-label">Admin Username(Email address)</label>
                <input type="email" class="form-control" id="admin_email" name="admin_email" v-model="formData.admin_email" placeholder="Enter email" required>
              </div>
              <div class="mb-3">
                <label for="admin_password" class="form-label">Password</label>
                <input type="password" class="form-control" id="admin_password" name="admin_password" v-model="formData.admin_password" placeholder="Password" required>
              </div>
              <button type="submit" class="SigninComponent-btn-primary btn-primary btn w-100">Sign In</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>`,
    data: function() {
        return {
          imageSrc: "/static/images/account.png", // Image path for illustration
          formData: {
            admin_email: "",
            admin_password: ""
          },
        };
    },
    methods: {
        async submitAdminSignin() {
            // console.log("Login data:", this.formData);
        
            try {
              const response = await fetch('/api/admin_signin', {
                method: 'POST',
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(this.formData),
              });
        
              if (response.ok) {
                const message = "Admin Signed in Successfully. Redirecting to Admin Home page in 3secs. Thank you."
                const status = "true"
                const data = await response.json();
                if (data.status === "success" && data.flag === 1) {
                  localStorage.setItem("admin_username",data.data.admin_username)
                  localStorage.setItem("admin_loggedIn",data.data.admin_loggedIn)
                  localStorage.setItem("admin_name",data.data.admin_name)
                //   localStorage.setItem("role",data.data.role)
                //   localStorage.setItem("user_id",data.data.user_id)

                  // Emit an event for Navbar
                  this.$root.$emit('admin_login-success');
                  // console.log(csrf_token)
                  const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
                  csrfMetaTag.setAttribute('content',data.csrf_token);
                  // console.log(csrfMetaTag.getAttribute('content'))
                }
                // console.log("localStorage : ",localStorage.getItem("user_id"))
                this.$router.push(`/redirect/${message}/${status}`);
              }
              else {
                const errorData = await response.json();
                console.error('Signin failed:', errorData);
                const message= "Admin Sign in Failed. Redirecting to Admin Home page in 3secs. Please try again. Thank you."
                const status = "false"
                this.$router.push(`/redirect/${message}/${status}`);
              }
            }
            catch (error) {
              const message= "Admin Sign in Failed. Redirecting to Admin Home page in 3secs. Please try again. Thank you."
              const status = "false"
              console.error('Error during Signin:', error);
              this.$router.push(`/redirect/${message}/${status}`)
            }
        },

    }
})

export default AdminSignin;
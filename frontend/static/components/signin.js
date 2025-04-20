
const Signin = Vue.component("SigninComponent", {
    template: `
    <div class="container-fluid">
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
            <form @submit.prevent="submitSignin">
              <div class="mb-3">
                <label for="email" class="form-label">Username</label>
                <input type="email" class="form-control" id="email" name="email" v-model="formData.email" placeholder="Enter email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" name="password" v-model="formData.password" placeholder="Password" required>
              </div>
              <button type="submit" class="SigninComponent-btn-primary btn-primary btn w-100">Sign In</button>
            </form>
            <p class="mt-3 text-center">
              Don't have an account? create one : <router-link :to="signupUrl" class="SigninComponent-text-primary">Sign up</router-link>
            </p>
            <div class="mt-3 text-center">
              <p style="font-weight: bolder;">Or log in with:</p>
              <a :href="googleSignInUrl" class="SigninComponent-google">
                  <img :src="googleIconSrc" alt="Google">
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>`,
    data: function() {
        return {
          signupUrl : "/signup",
          imageSrc: "/static/images/account.png", // Image path for illustration
          googleSignInUrl: "/api/signin_google", // URL for Google sign-in
          googleIconSrc: "https://img.shields.io/badge/Google-Connect-brightgreen?style=for-the-badge&labelColor=black&logo=google",
          formData: {
            email: "",
            password: ""
          },
        };
    },
    methods: {
      async submitSignin() {
        // console.log("Login data:", this.formData);
    
        try {
          const response = await fetch('/api/signin', {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.formData),
          });
          console.log("Response : ",response)
          if (response.ok) {
            
            const data = await response.json();
            // console.log(data.data.username)
            if (data.status === "success" && data.flag === 1) {
              const message = "User Signed in Successfully. Redirecting to Home page in 3secs. Thank you."
              const status = "true"
              localStorage.setItem("username",data.data.username)
              localStorage.setItem("loggedIn",data.data.loggedIn)
              localStorage.setItem("role",data.data.role)
              localStorage.setItem("user_id",data.data.user_id)

              // Emit an event for Navbar
              this.$root.$emit('login-success');
              // console.log(csrf_token)
              const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
              csrfMetaTag.setAttribute('content',data.csrf_token);
              // console.log(csrfMetaTag.getAttribute('content'))
              this.$router.push(`/redirect/${message}/${status}`);
            }
            else{
              console.log(data.message)
              const message = "!!! User Blocked !!!. You cannot access the application anymore. Please contact admin."
              const status = "false"
              this.$router.push(`/redirect/${message}/${status}`);
            }
            // console.log("localStorage : ",localStorage.getItem("user_id"))
          }
          else {
            const errorData = await response.json();
            console.error('Login failed:', errorData);
            const message= "User Sign in Failed. Redirecting to Home page in 3secs. Please try again. Thank you."
            const status = "false"
            this.$router.push(`/redirect/${message}/${status}`);
          }
        }
        catch (error) {
          const message= "User Sign in Failed. Redirecting to Home page in 3secs. Please try again. Thank you."
          const status = "false"
          console.error('Error during login:', error);
          this.$router.push(`/redirect/${message}/${status}`)
        }
    },

    }
});

export default Signin
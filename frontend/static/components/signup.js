
const Signup = Vue.component("SignupComponent" ,{
    template: `
    <div class="container-fluid">
    <div class="row vh-100 d-flex justify-content-center align-items-center">
      <!-- Image Section -->
      <div class="col-md-6">
        <div class="SignupComponent-image-container">
          <img :src="imageSrc" alt="Illustration" class="SignupComponent-img-fluid img-fluid">
        </div>
      </div>
      
      <!-- Sign Up Form Section -->
      <div class="col-md-6">
        <div class="SignupComponent-form">
          <div class="SignupComponent-logo">
            <i class="fa-solid fa-bell-concierge fa-bounce fa-2xl"></i>
          </div>
          <h2 class="SignupComponent-title text-center">Sign up</h2>
          <p v-if="errors.length">
            <b><span style="color:red">Please correct the following error/s:</span></b>
            <ul>
              <li v-for="error in errors"><span style="color:red">{{ error }}</span></li>
            </ul>
          </p>
          <form @submit.prevent="submitSignup">
            <div class="SignupComponent-form-scroll">
              <div class="mb-3">
                <label for="firstname" class="form-label">First name <span style="color:red"> * </span></label>
                <input type="text" class="form-control" id="firstname" name="firstname" v-model="formData.firstname" placeholder="First name" required>
              </div>
              <div class="mb-3">
                <label for="lastname" class="form-label">Last name <span style="color:red"> * </span></label>
                <input type="text" class="form-control" id="lastname" name="lastname" v-model="formData.lastname" placeholder="Last name" required>
              </div>
              <div class="mb-3">
                <label for="signup_email" class="form-label">Email(This will be your username) <span style="color:red"> * </span></label>
                <input type="email" class="form-control" id="signup_email" name="signup_email" v-model="formData.email" placeholder="Enter Email" required>
                <!-- Verify Email Button below Email Field -->
                <div v-if="otpSent === false && emailVerified === false" class="mt-2">
                  <button type="button" class="btn btn-outline-secondary btn-sm" @click="sendOtp(formData.email)">
                    Verify Email
                  </button>
                </div>
                <div v-if="otpSent === true && emailVerified === false" class="mt-2 d-flex align-items-center">
                  <!-- OTP Input Field -->
                  <input type="text" v-model="otp" placeholder="Enter OTP" class="form-control me-2" style="width: 120px;" />
                  
                  <!-- Submit Button -->
                  <button type="button" class="btn btn-outline-secondary btn-sm" @click="submitOtp(formData.email)">
                    Submit OTP
                  </button>

                  <!-- Resend Button -->
                  <button type="button" class="btn btn-outline-secondary btn-sm" @click="resendOtp(formData.email)" :disabled="!resendEnabled">
                    Resend
                  </button>
                  
                  <!-- Timer Display -->
                  <p v-if="timeRemaining > 0" class="text-muted mt-2">
                    <span style="color:red"> Time remaining: {{ formattedTime }} </span>
                  </p>
                </div>
                <p v-if="otpMessage" class="text-warning mt-1">{{ otpMessage }}</p>
              </div>
              <div class="mb-3">
                <label for="dob" class="form-label">Date of Birth</label>
                <input 
                  type="date" 
                  id="dob" 
                  name="dob" 
                  class="form-control" 
                  v-model="formData.dob" 
                />
                <div v-if="formData.dob" class="mt-3">
                  Selected DOB: {{ formData.dob }}
                </div>
              </div>
              <div class="mb-3">
                <label for="gender" class="form-label">Gender <span style="color:red"> * </span></label>
                <select class="form-select" id="gender" name="gender" v-model=formData.gender required>
                    <option value="" disabled selected>Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password <span style="color:red"> * </span></label>
                <input type="password" class="form-control" id="password" name="password" v-model="formData.password" placeholder="Password" required>
                <ul>
                  <li :class="{ valid: passwordValidation.length }"> Minimum 8 characters</li>
                  <li :class="{ valid: passwordValidation.uppercase }"> At least 1 uppercase letter</li>
                  <li :class="{ valid: passwordValidation.lowercase }"> At least 1 lowercase letter</li>
                  <li :class="{ valid: passwordValidation.specialChar }"> At least 1 special character (@,#,_,$)</li>
                  <li :class="{ valid: passwordValidation.digit }"> At least 1 digit</li>
                </ul>

                <p v-if="isValidPassword">✅ Password is valid!</p>
              </div>
              <div class="mb-3">
                  <label for="conf_password" class="form-label">Confirm Password <span style="color:red"> * </span></label>
                  <input type="password" class="form-control" id="conf_password" name="conf_password" v-model="formData.conf_password" placeholder="Confirm Password" required>
              </div>
              <div class="mb-3">
                  <label for="pincode" class="form-label">Pincode <span style="color:red"> * </span></label>
                  <input type="number" class="form-control" id="pincode" name="pincode" v-model="formData.pincode" placeholder="Enter your pincode" maxlength="6" pattern="\d{6}" required>
              </div>
              <div class="mb-3">
                  <label for="phone" class="form-label">Phone Number <span style="color:red"> * </span></label>
                  <input type="tel" class="form-control" id="phone" name="phone" v-model="formData.phone" placeholder="Enter your 10-digit phone number" maxlength="10"" required>
              </div>
              <div class="mb-3">
                <label for="address" class="form-label">Address <span style="color:red"> * </span></label>
                <textarea class="form-control" id="address" name="address" rows="3" v-model="formData.address" placeholder="Enter your address" required></textarea>
              </div>
              <div class="mb-3">
                  <label for="address_link" class="form-label">Google Maps Link <span style="color:red"> * </span></label>
                  <input type="text" class="form-control" id="address_link" name="address_link" v-model="formData.address_link" placeholder="Your residence Link from Google Maps" required>
              </div>
              <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" id="offersCheck" name="offersCheck" v-model="formData.offersCheck">
                  <label class="form-check-label" for="offersCheck">
                      Send me special offers and personalized recommendations.
                  </label>
              </div>   
            </div> 
            <button type="submit" class="SignupComponent-btn-primary btn-primary btn w-100">Sign up</button>
          </form>
          <p class="mt-3 text-center">
            Already have an account? <router-link :to="signinUrl" class="SignupComponent-text-primary">Log in</router-link>
          </p>
        </div>
      </div> 
    </div>           
    </div>`,

    data: function() {
        return {
        otp: "",
        otpMessage : "",
        otpSent: false, // set to true after sending OTP for testing purposes
        resendEnabled: false,
        timeRemaining: 180, // 3 minutes in seconds
        emailVerified : false,
        validPswd : false,
        imageSrc: "/static/images/account.png",
        signinUrl : "/signin",
        errors : [],
        formData: {
            firstname: "",
            lastname: "",
            email: "",
            dob: "",
            gender: "",
            password: "",
            conf_password: "",
            pincode: "",
            phone: "",
            address: "",
            address_link: "",
            offersCheck: false
        },
      };
    },
    methods: {

        checkSignupFrom(){
            this.errors = [];
            if(!this.formData['firstname']){
                this.errors.push("FirstName required")
            }
            if(!this.formData['lastname']){
                this.errors.push("LastName required")
            }
            if(!this.formData['gender']){
                this.errors.push("Gender required")
            }
            if(!this.formData['password']){
                this.errors.push("Password required")
            }
            if(!this.validPswd){
                this.errors.push("Password does not match the constraints.")
            }
            if(!this.formData['conf_password']){
                this.errors.push("Retype the password for confirmation")
            }
            if(this.formData["password"] != this.formData["conf_password"]){
                this.errors.push("Retyped password does not match.")
            }
            if(!this.formData['pincode']){
                this.errors.push("Pincode required")
            }
            if(!this.formData['address']){
                this.errors.push("Address required")
            }
            
            if(!this.formData['address_link']){
                this.errors.push("Address : Google maps link required")
            }
            if(!this.formData['phone']){
                this.errors.push("Phone required")
            }
            if(!this.emailVerified){
                this.errors.push("Email not verified.")
            }
            return this.errors.length === 0;  //Return true if no errors
        },



        async submitSignup() {
            console.log("Signup data:", this.formData);
            // console.log(this.checkSignupFrom())
            if(this.checkSignupFrom()){
                try {
                    // Get CSRF token from the meta tag in the head of index.html
                    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                    // const response = await fetch('/api/signup', {
                    //     method: 'POST',
                    //     headers: {
                    //       "Content-Type": "application/json",
                    //     },
                    //     body: JSON.stringify(this.formData),
                    // });
                    const response = await axios.post(`/api/signup`, this.formData,{
                      headers: {
                      "Content-Type": "application/json",
                      'X-CSRF-Token': csrfToken
                      },
                    });
                  // console.log(this.formData)
                    const data = response.data
                    
                    if (data.status === "success" && data.flag === 1) {
                        // this.$router.push('/signin');
                        const message = "User Registered Successfully. Redirecting to Home page in 3secs. Thank you."
                        const status = "true"
                        this.$router.push(`/redirect/${message}/${status}`);
                    }
                    if (response.status != 200) {
                        // const errorData = await response.json();
                        console.error('Hi HI...Login failed:', data.message);
                        const message = "User Registered failed. Redirecting to Home page in 3secs. Please try again. Thank you."
                        const status = "false"
                        this.$router.push(`/redirect/${message}/${status}`);
                    }
                }
                catch (error) {
                    console.error('Error during login:', error);
                    const message = "User Registered failed. Redirecting to Home page in 3secs. Please try again. Thank you."
                    const status = "false"
                    this.$router.push(`/redirect/${message}/${status}`);
                }
            }
        },



        validateEmail(email){
            return email.match(
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              );
        },

        startTimer() {
            this.resendEnabled = false;
            this.timeRemaining = 180; // reset to 3 minutes
            const countdown = setInterval(() => {
              if (this.timeRemaining > 0) {
                this.timeRemaining--;
                // Enable resend after 1 minute
                if (this.timeRemaining <= 120) {
                  this.resendEnabled = true;
                }
              } else {
                clearInterval(countdown);
              }
            }, 1000);
        },
          

        async sendOtp(email) {
            // console.log(this.formData);
            // console.log(this.validateEmail(email))
            if(this.validateEmail(email)){
                const url = `/api/generate_otp`;
            
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({"mail_id": email})
                    });
                
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }
                
                    const data = await response.json();
                    this.otpSent = true
                    this.startTimer()
                    console.log('OTP sent successfully:');
                    this.otpMessage = "Resend will be enable after a minute."
                } 
                catch (error) {
                    console.error('There was an error with the OTP request:', error);
                }
            }
            else{
                this.errors = []
                this.errors.push("Invalid email.")
            }
        },



        async submitOtp(email) {
            try {
              const response = await fetch('/api/verify_otp', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  mail_id: email,  // email to verify OTP for
                  user_otp: this.otp // OTP entered by user
                }),
              });
        
              const data = await response.json();
        
              if (response.ok) {
                // Handle success
                if(data["flag"] == 1){
                    console.log('OTP verified.');
                    this.otpMessage = "Email verified."
                    this.emailVerified = true
                    console.log("Email verified successgullt",this.emailVerified)
                    // Set email field as readonly
                    const emailField = document.getElementById('signup_email');
                    emailField.setAttribute('readonly', 'true');
                }
                else{
                    console.log('OTP mismatch');
                    this.otpMessage = "OTP mismatch."
                }
              }
              if(response.status === 410) {
                console.log("OTP expired. Please click Resend to verify.")
                this.otpMessage = "OTP Expired. Please try again." 
              }
            }
            catch (error) {
              console.error('Error:', error);
            }
        },


        async resendOtp(email) {
            // Resend OTP and reset timer
            console.log("Resending OTP...");
            const url = `/api/generate_otp`;
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({"mail_id": email})
                });
            
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
            
                const data = await response.json();
                this.otpSent = true
                this.startTimer()
                console.log('OTP resent successfully:');
            } 
            catch (error) {
                console.error('There was an error with the OTP request:', error);
            }
        },


    },
    computed: {
        formattedTime() {
          const minutes = Math.floor(this.timeRemaining / 60);
          const seconds = this.timeRemaining % 60;
          return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        },
        passwordValidation() {
          return {
            length: this.formData['password'].length >= 8,
            uppercase: /[A-Z]/.test(this.formData['password']),
            lowercase: /[a-z]/.test(this.formData['password']),
            specialChar: /[@#_$]/.test(this.formData['password']),
            digit: /\d/.test(this.formData['password']),
          };
        },
        isValidPassword() {
          this.validPswd = Object.values(this.passwordValidation).every(Boolean);
          return this.validPswd
        }
    },
})

export default Signup;
const SignOut = Vue.component("SignOutComponent",{
    template :`
    <div class="root-body">
        <div class="SignOutComponent-message">
            <div>
                <div class="">
                    <p>Are you sure you want to logout?</p>
                    <button type="button" class="btn btn-outline-danger btn-md" @click="signOut">
                    SignOut
                    </button>
                </div>
            </div>
        </div>
    </div>
    `,
    methods:{
        async signOut(){
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            try {
                const response = await fetch('/api/signout', {
                  method: 'GET',
                  headers: {
                    "Content-Type": "application/json",
                    'X-CSRF-Token': csrfToken
                  },
                });
          
                if (response.ok) {
                  const message = "User Signed Out Successfully. Redirecting to Home page in 3secs. Thank you."
                  const status = "true"
                  const data = await response.json();
                  if (data.status === "success" && data.flag === 1) {
                    localStorage.setItem("username","")
                    localStorage.setItem("loggedIn","0")
                    localStorage.setItem("role","")
                    localStorage.setItem("user_id","")
  
                    // Emit an event for Navbar
                    this.$root.$emit('login-success');
                    const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
                    csrfMetaTag.setAttribute('content',"");
                    // console.log(csrfMetaTag.getAttribute('content'))
                  }
                  // console.log("localStorage : ",localStorage.getItem("user_id"))
                  this.$router.push(`/redirect/${message}/${status}`);
                }
                else {
                  const errorData = await response.json();
                  console.error('Login failed:', errorData);
                  // const message= "User Sign Out Failed. Redirecting to Home page in 3secs. Please try again. Thank you."
                  // const status = "false"
                  window.location.href = '/';
                  // this.$router.push(`/redirect/${message}/${status}`);
                }
              }
              catch (error) {
                // const message= "User Sign Out Failed. Redirecting to Home page in 3secs. Please try again. Thank you."
                // const status = "false"
                console.error('Error during login:', error);
                window.location.href = '/';
                // this.$router.push(`/redirect/${message}/${status}`)
              }
        }
    }
})

export default SignOut;
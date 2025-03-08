const AdminSignOut = Vue.component("AdminSignOutComponent",{
    template :`
    <div class="root-body">
        <div class="SignOutComponent-message">
            <div>
                <div>
                    <p>Are you sure you want to logout?</p>
                    <button type="button" class="btn btn-outline-danger btn-md" @click="admin_signOut">
                    SignOut
                    </button>
                </div>
            </div>
        </div>
    </div>
    `,
    methods:{
        async admin_signOut(){
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            try {
                const response = await fetch('/api/admin_signout', {
                  method: 'GET',
                  headers: {
                    "Content-Type": "application/json",
                    'X-CSRF-Token': csrfToken
                  },
                });
          
                if (response.ok) {
                  const message = "Admin Signed Out Successfully. Redirecting to Admin Home page in 3secs. Thank you."
                  const status = "true"
                  const data = await response.json();
                  if (data.status === "success" && data.flag === 1) {
                    localStorage.setItem("admin_username","")
                    localStorage.setItem("admin_loggedIn","0")
                    localStorage.setItem("admin_name","")
                    // localStorage.setItem("role","")
                    // localStorage.setItem("user_id","")
  
                    // Emit an event for Navbar
                    const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
                    csrfMetaTag.setAttribute('content',"");
                    this.$root.$emit('admin_login-success');
                    // console.log(csrfMetaTag.getAttribute('content'))
                  }
                  // console.log("localStorage : ",localStorage.getItem("user_id"))
                  this.$router.push(`/redirect/${message}/${status}`);
                }
                else {
                  const errorData = await response.json();
                  console.error('Logout failed:', errorData);
                  // const message= "Admin Sign Out Failed. Redirecting to Admin Home page in 3secs. Please try again. Thank you."
                  // const status = "false"
                  // this.$router.push(`/redirect/${message}/${status}`);
                  window.location.href = '/admin';
                }
              }
              catch (error) {
                // const message= "Admin Sign Out Failed. Redirecting to Admin Home page in 3secs. Please try again. Thank you."
                // const status = "false"
                console.error('Error during login:', error);
                // this.$router.push(`/redirect/${message}/${status}`)
                window.location.href = '/admin';
              }
        }
    }
})
export default AdminSignOut;
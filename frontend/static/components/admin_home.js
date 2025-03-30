const AdminHome = Vue.component("AdminHomeComponent",{
    template:`

    <div v-if ="loggedIn === '1'" class="AdminHomeComponent-fullpage" id="main-content">
        <div class="row my-5 mx-5">
            <div class="col-12 col-md-6">
                <div class="AdminHomeComponent-dataholder container px-5 py-2" @click="redirect('Customers')" style="background-color: #f1f1f1;border-radius: 10%;width:250px;height:200px">
                    <div class="text-center"><h2>Total Customers</h2></div>
                    <div class="text-center"><h3>- {{ total_customers }} -</h3></div>
                </div>
            </div>
            <div class="col-12 col-md-6">
                <div class="AdminHomeComponent-dataholder container px-5 py-2" @click="redirect('Professionals')" style="background-color: #f1f1f1;border-radius: 10%;width:250px;height:200px">
                    <div class="text-center"><h2>Total Professionals</h2></div>
                    <div class="text-center"><h3>- {{ total_professionals }} -</h3></div>
                </div>
            </div>
        </div>
        <div class="row my-5 mx-5">
            <div class="col-12 col-md-6">
                <div class="AdminHomeComponent-dataholder container px-5 py-2" @click="redirect('Service Categories')" style="background-color: #f1f1f1;border-radius: 10%;width:250px;height:200px">
                    <div class="text-center"><h2>Total Service Categories</h2></div>
                    <div class="text-center"><h3>- {{ total_srvc_cats }} -</h3></div>
                </div>
            </div>
            <div class="col-12 col-md-6">
                <div class="AdminHomeComponent-dataholder container px-5 py-2" @click="redirect('Blocked Users')" style="background-color: #f1f1f1;border-radius: 10%;width:250px;height:200px">
                    <div class="text-center"><h2>Total Blocked Users</h2></div>
                    <div class="text-center"><h3>- {{ blckd_users }} -</h3></div>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <div class="status-container">
            <div>
                <div>
                    <p>Please SignIn to show content</p>
                    <button type="button" class="btn btn-outline-primary btn-md" @click="admin_signIn">
                    SignIn
                    </button>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return{
            total_srvc_cats : 0,
            total_professionals : 0,
            total_customers : 0,
            blckd_users : 0,
            loggedIn : "0"
        }
    },
    methods: {
        admin_signIn(){
            this.$router.push(`/admin_signin`);
        },
        async fetchCustCount() {
          try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            // console.log(csrfToken)
            const response = await fetch("/api/fetch_count/0", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                'X-CSRF-Token': csrfToken
              },
            });
      
            if (!response.ok) {
              const errorData = await response.json();
              console.error("Error submitting request:", errorData.message);
              throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
            }
      
            const data = await response.json();
      
            if (data.status === "success" && data.flag === 1) {
              this.total_customers = data.data;
            }
          }
          catch (error) {
            console.error("Error fetching services:", error.message);
          }
        },
        async fetchProfCount() {
            try {
              const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
              const response = await fetch("/api/fetch_count/1", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  'X-CSRF-Token': csrfToken
                },
              });
        
              if (!response.ok) {
                const errorData = await response.json();
                console.error("Error submitting request:", errorData.message);
                throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
              }
        
              const data = await response.json();
        
              if (data.status === "success" && data.flag === 1) {
                this.total_professionals = data.data;
              }
            }
            catch (error) {
              console.error("Error fetching services:", error.message);
            }
          },
          async fetchSrvcCatsCount() {
            try {
              const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
              const response = await fetch("/api/fetch_count/2", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  'X-CSRF-Token': csrfToken
                },
              });
              if (!response.ok) {
                const errorData = await response.json();
                console.error("Error submitting request:", errorData.message);
                throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
              }
        
              const data = await response.json();
        
              if (data.status === "success" && data.flag === 1) {
                this.total_srvc_cats = data.data;
              }
            }
            catch (error) {
              console.error("Error fetching services:", error.message);
            }
          },
          async fetchBlockedUsers() {
            try {
              const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
              const response = await fetch("/api/fetch_count/3", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  'X-CSRF-Token': csrfToken
                },
              });
              if (!response.ok) {
                const errorData = await response.json();
                console.error("Error submitting request:", errorData.message);
                throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
              }
        
              const data = await response.json();
        
              if (data.status === "success" && data.flag === 1) {
                this.blckd_users = data.data;
              }
            }
            catch (error) {
              console.error("Error fetching services:", error.message);
            }
          },
          redirect(flag){
            this.$router.push(`/admin_details/${flag}`);
          }
    },
    mounted() {
      // fetch('/api/get_flash_messages_admin')  // API to get flashed messages
      // .then(response => response.json())
      // .then(data => {
      //   if (data.message) {
      //     alert(data.message);  // Show alert when the token expires
      //   }
      // });
        this.loggedIn = localStorage.getItem("admin_loggedIn")
        if(this.loggedIn === "1"){
            this.fetchCustCount();
            this.fetchProfCount();
            this.fetchSrvcCatsCount();
            this.fetchBlockedUsers();
        }
        localStorage.setItem("admin_nav","Admin Home")
        // Emit an event for Navbar
        this.$root.$emit('admin_login-success');
    },
})

export default AdminHome;
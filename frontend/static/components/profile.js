const Profile = Vue.component("ProfileComponent",{
    template:`
  <div>
  <div class="container mt-5">
    <!-- Profile Header -->
    <div class="ProfileComponent-profile-header rounded shadow-sm">
      <h1>{{ userDetails.fullname }}</h1>
      <p>{{ userDetails.username }}</p>
      <p>{{ userDetails.role }}</p>
      <img :src="userDetails.image_url" :alt="'Profile Image'">
    </div>

    <!-- Profile Details -->
    <div class="row mt-4">
      <div class="col-md-6 mb-3">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Name-DOB</h5>
            <hr>
            <p><strong>First Name : </strong>{{ userDetails.first_name }}</p>
            <p><strong>Last Name : </strong>{{ userDetails.last_name}}</p>
            <p><strong>DOB : </strong>{{ userDetails.dob }}</p>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-3">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Contact-Address</h5>
            <hr>
            <p><strong>Email : </strong>{{ userDetails.username }}</p>
            <p><strong>Address : </strong>{{ userDetails.address}}</p>
            <p><strong>Pincode : </strong>{{ userDetails.pincode}}</p>
            <p><strong>Address link : </strong>{{ userDetails.address_link}}</p>
            <p><strong>Phone Number : </strong>{{ userDetails.phone }}</p>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-3">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Order Summary</h5>
            <hr>
            <p><strong>Pending Orders : </strong>{{ userDetails.pend_orders }}</p>
            <p><strong>Completed(Accepted) Orders : </strong>{{ userDetails.cmpd_orders }}</p>
            <p><strong>Rejected Orders : </strong>{{ userDetails.rjtd_orders }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>


  <!-- Accepted/Rejected Service Requests -->
  <div>
    <h3>Completed/Rejected Orders</h3>
    <div v-if="serviceRequests.length" class="container ProfileComponent-container">
      <div v-for="srvcreq in serviceRequests" :key="srvcreq.srvcreq_id" class="ProfileComponent-card card my-3">
        
        <!-- Card Content -->
        <div class="card-content ProfileComponent-card-content">
          <div class="card-body ProfileComponent-card-body">
              <h5 class="ProfileComponent-card-title card-title">{{ srvcreq.srvc_name }}</h5>
              <p class="ProfileComponent-card-text card-text">
                  <strong>Category: </strong> {{ srvcreq.srvc_cat }}
              </p>
              <p class="ProfileComponent-card-text card-text">
                  <strong>Status: </strong> {{ srvcreq.srvc_status }}
              </p>
              <p>
                  <strong>Professional Name: </strong> {{ srvcreq.prof_name }}
              </p>
              <p v-if="srvcreq.cust_rating !== -1">
                  <strong>Rating Given to Professional: </strong> {{ srvcreq.cust_rating }}
              </p>
              <p>
                  <strong>Date Requested: </strong> {{ srvcreq.date_srvcreq }}
              </p>
              
              <!-- Action Buttons -->
              <div v-if = "srvcreq.cust_rating === -1 && srvcreq.srvc_status === 'accepted'" class="card-buttons">
                <button class="btn btn-outline-primary btn-sm" @click="rateModalFunc(srvcreq)">Rate</button>
              </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else style="display: flex; flex-direction: column; align-items: center;text-align: center;">
      
      <p><span style="color:blue">No Completed/Rejected Orders</span></p>
    </div>
  </div>


  <!-- Pending Service Requests -->
  <div>
    <h3>Pending Orders</h3>
    <div v-if="serviceRequestsPend.length" class="container ProfileComponent-container">
      <!-- Iterate over the service requests array -->
      <div v-for="srvcreq_p in serviceRequestsPend" :key="srvcreq_p.srvcreq_id" class="ProfileComponent-card card my-3">
        
        <!-- Card Content -->
        <div class="card-content ProfileComponent-card-content">
          <div class="card-body ProfileComponent-card-body">
              <h5 class="ProfileComponent-card-title card-title">{{ srvcreq_p.srvc_name }}</h5>
              <p class="ProfileComponent-card-text card-text">
                  <strong>Category: </strong> {{ srvcreq_p.srvc_cat }}
              </p>
              <p class="ProfileComponent-card-text card-text">
                  <strong>Service Name: </strong> {{ srvcreq_p.srvc_name }}
              </p>
              <p class="ProfileComponent-card-text card-text">
                  <strong>Status: </strong> {{ srvcreq_p.srvc_status }}
              </p>
              <p class="ProfileComponent-card-text card-text">
                  <strong>Professional Name: </strong> {{ srvcreq_p.prof_name }}
              </p>
          </div>
        </div>
      </div>
    </div>
    <div v-else style="display: flex; flex-direction: column; align-items: center;text-align: center;">
      <p><span style="color:green">No Pending Orders </span></p>
    </div>
  </div>


  <div v-if="servicereq_selected" id="myModal_Rate" class="ProfileComponent-modal modal" style="position:fixed;top:15%;left:30%;width: 50%;height : 70%;max-width:500px;">
      <div class="ProfileComponent-modal-content modal-content" style="width: 100%">
        <span class="ProfileComponent-close" @click="closeRateModal()">&times;</span> 
          <form class="form">
              <div class="mb-3">
                  <div class="mb-3">
                      <label for="service_rating" class="form-label">Rating(1-5 -> 1 : lowest , 5 : highest) <span style="color:red;">*</span> </label>
                      <input type="number" min="1" max="5" step="0.1" class="form-control" id="service_rating" name="service_rating" v-model="servicereq_selected.cust_rating" required placeholder="Give rating">
                  </div>
                  <div class="mb-3">
                      <label for="service_review" class="form-label">Review</label>
                      <input type="text" class="form-control" id="service_review" name="service_review" v-model="servicereq_selected.cust_review" placeholder = "Give some review">
                  </div>
                  <!-- <input type="hidden" name="servicereq_id" id="servicereq_id" value="">  -->
              </div>
              <button type="button" :id="'submit_rating_' + servicereq_selected.srvcreq_id" class="btn btn-outline-primary btn-sm" @click="submitRating($event)">Submit Rating</button>
          </form>
      </div>
  </div>
  </div>
  `,
  data() {
    return {
        // rating_given : false,
        userDetails: {
            username:"",
            image_url:"",
            role:"",
            fullname:"",
            first_name:"",
            last_name:"",
            dob:"",
            address:"",
            address_link:"",
            pincode: "",
            phone:"",
            pend_orders:0,
            cmpd_orders:0,
            rjtd_orders:0
        },
        serviceRequests: [], // Holds the data fetched from the API
        serviceRequestsPend : [], // Holds the data fetched from the API
        servicereq_selected : null
    };
  },
  methods: {
    async fetchUserDetails(){
        try {
            const user_id = this.$route.params.id || localStorage.getItem('user_id')
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            // console.log("CSRF Token : ",csrfToken)
            const response = await fetch(`/api/users?user_id=${user_id}`, {
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
              this.userDetails.username = data.data[0].user_username;
              this.userDetails.image_url = data.data[0].user_image_url,
              this.userDetails.role = data.data[0].user_role === 'cust' ? 'Customer' : 'Professional';
              this.userDetails.fullname = data.data[0].user_fullname
              this.userDetails.first_name = data.data[0].user_firstname
              this.userDetails.last_name = data.data[0].user_lastname
              this.userDetails.dob = data.data[0].user_dob
              this.userDetails.address = data.data[0].user_address
              this.userDetails.address_link = data.data[0].user_address_link
              this.userDetails.pincode = data.data[0].user_pincode
              this.userDetails.phone = data.data[0].user_phone
            }
            else {
                console.error("Failed to fetch services:", data.message);
            }
        } 
        catch (error) {
            console.error("Error fetching services:", error.message);
        }
    },
    async fetchServiceRequests() {
      try {
        const user_id = this.$route.params.id || localStorage.getItem('user_id')
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        // console.log("CSRF Token : ",csrfToken)
        const response = await fetch(`/api/srvc_req/${user_id}/0`, {
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
          this.serviceRequests = data.data_cust;
          // console.log(data)
          // this.rating_given = (this.serviceRequests.prof_rating == -1) ? false : true
          console.log("Accepted/Rejected Services fetched successfully.")

        }
        else {
            console.error("Failed to fetch services:", data.message);
          }
        } 
      catch (error) {
        console.error("Error fetching services:", error.message);
      }
    },
    async fetchServiceRequestsPend() {
        try {
          const user_id = this.$route.params.id || localStorage.getItem('user_id')
          const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
          // console.log("CSRF Token : ",csrfToken)
          const response = await fetch(`/api/srvc_req/${ user_id }/1`, {
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
            // console.log(data)
            this.serviceRequestsPend = data.data_cust;
            console.log("Pending Services fetched successfully.")
          }
          else {
              console.error("Failed to fetch Pending services:", data.message);
              
            }
          } 
        catch (error) {
          console.error("Error fetching services:", error.message);
        }
      },
      async fetchOrderSummary(){
        try {
          const user_id = this.$route.params.id || localStorage.getItem('user_id')
          const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
          // console.log("CSRF Token : ",csrfToken)
          const response = await fetch(`/api/orderSummary/${ user_id }`, {
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
            console.log(data.data)
            this.userDetails.cmpd_orders = data.data.srvc_reqs_cmpd
            this.userDetails.pend_orders = data.data.srvc_reqs_pend
            this.userDetails.rjtd_orders = data.data.srvc_reqs_rjtd
            console.log(this.userDetails.cmpd_orders,this.userDetails.pend_orders)
            console.log("Order Summary fetched successfully.")
          }
          else {
              console.error("Failed to fetch Order Summary :", data.message);
            }
          } 
        catch (error) {
          console.error("Error fetching Order Summary", error.message);
        }
      },

      async submitRating(event){
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        // const srvcreq_id = document.getElementById("servicereq_id").value
        const form = event.target.closest("form");
        const srvcreq_id = this.servicereq_selected.srvcreq_id
        const button_rate = form.querySelector(`#submit_rating_${this.servicereq_selected.srvcreq_id}`); // Replace with the actual button ID
        button_rate.disabled = true;
        // Change the button content
        button_rate.textContent = "Submiting.....";
        const requestData = {
            cust_rating: this.servicereq_selected.cust_rating,
            cust_review: this.servicereq_selected.cust_review
        };
          try{
            const response = await fetch(`/api/rating/cust/${srvcreq_id}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                'X-CSRF-Token': csrfToken
              },
              body:JSON.stringify(requestData),
            });
      
            if (!response.ok) {
              const errorData = await response.json();
              console.error("Error submitting request:", errorData.message);
              throw new Error(`HTTP Error: ${errorData.status} - ${errorData.status}`);
            }
      
            const data = await response.json();
      
            if (data.status === "success" && data.flag === 1) {
                console.log("Rating Done.", data.message);
                button_rate.disabled = true;
                // Change the button content
                button_rate.textContent = "Submited";
                this.closeRateModal();
                
            }
            else {
                console.error("Failed", data.message);
                window.location.reload();
              }
            } 
          catch (error) {
            console.error("Error", error);
            window.location.reload();
          }
      },


      rateModalFunc(servicereq){
        // console.log(servicereq)
        this.servicereq_selected = servicereq;
        this.$nextTick(() => {
            const modal = document.getElementById('myModal_Rate');
            if (modal) {
                modal.style.display = 'block';
            } else {
                console.error("Modal not found in DOM");
            }
        });
        // document.getElementById('myModal_Rate').style.display = 'block';
        // document.getElementById('servicereq_id').value = servicereq.srvcreq_id;
      },


      closeRateModal() {
        document.getElementById("myModal_Rate").style.display = 'none'
        this.servicereq_selected = null
      },
  },
  mounted() {
    this.fetchUserDetails(),
    this.fetchServiceRequests(),
    this.fetchServiceRequestsPend(),
    this.fetchOrderSummary()
    localStorage.setItem("nav","User Profile")
    // Emit an event for Navbar
    this.$root.$emit('login-success');
  }
})

export default Profile;
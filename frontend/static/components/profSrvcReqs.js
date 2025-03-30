const ProfSrvcReqs = Vue.component("ProfSrvcReqsComponent",{
    template:`
    <!-- Pending Service Requests -->
  <div>
    <h3>Pending Requests</h3>
    <div v-if="serviceRequestsPend.length > 0" class="container ProfSrvcReqsComponent-container">
      <!-- Iterate over the service requests array -->
      <div v-for="srvcreq_p in serviceRequestsPend" :key="srvcreq_p.srvcreq_id" class="ProfSrvcReqsComponent-card card my-3">

        <!-- Card Content -->
        <div class="card-content ProfSrvcReqsComponent-card-content">
            <div class="card-body ProfSrvcReqsComponent-card-body">
                <h5 class="ProfSrvcReqsComponent-card-title card-title">{{ srvcreq_p.srvc_name }}</h5>
                <p class="ProfSrvcReqsComponent-card-text card-text">
                    <strong>Category: </strong> {{ srvcreq_p.srvc_cat }}
                </p>
                <p class="ProfSrvcReqsComponent-card-text card-text">
                    <strong>Service Name : </strong> {{ srvcreq_p.srvc_name }}
                </p>
                <!-- Action Buttons -->
                <div v-if="srvcreq_p.srvc_status === 'pending'" class="card-buttons">
                  <button class="btn btn-outline-primary btn-sm" @click="modalFunction(srvcreq_p)">View</button>
                </div
            </div>
        </div>
      </div>
      </div>
      <div v-else style="display: flex; flex-direction: column; align-items: center;text-align: center;">
          <p><span style="color:green">No Pending Requests</span></p>
      </div>


      
    <div v-if="servicereq_selected" id="myModal_RequestDetails" class="ProfSrvcReqsComponent-modal modal" style="position:fixed;top:15%;left:30%;width: 50%;height : 70%;max-width:500px;">
        <div class="ProfSrvcReqsComponent-modal-content modal-content" style="width: 100%">
          <span class="ProfSrvcReqsComponent-close" @click="closeModal()">&times;</span>
            <form class="form">
                <div class="mb-3">
                    <div class="mb-3">
                        <label for="serviceCat_name" class="form-label">Service Category</label>
                        <input type="text" class="form-control" id="serviceCat_name" name="serviceCat_name" :value="servicereq_selected.srvc_cat" readonly>
                    </div>
                    <div class="mb-3">
                        <label for="service_name" class="form-label">Service Name</label>
                        <input type="text" class="form-control" id="service_name" name="service_name" :value="servicereq_selected.srvc_name" readonly>
                    </div>
                    <div class="mb-3">
                        <label for="cust_name" class="form-label">Customer Name</label>
                        <input type="text" class="form-control" id="cust_name" name="cust_name" :value="servicereq_selected.customer_name" readonly>
                    </div>
                    <div class="mb-3">
                        <label for="srvc_status" class="form-label">Status</label>
                        <input type="text" class="form-control" id="srvc_status" name="srvc_status" :value="servicereq_selected.srvc_status" readonly>
                    </div>
                      <div class="mb-3">
                        <label for="srvc_datereq" class="form-label">Date of Service Request</label>
                        <input type="text" class="form-control" id="srvc_datereq" name="srvc_datereq" :value="servicereq_selected.date_srvcreq" readonly>
                    </div>
                    <div class="mb-3">
                        <label for="cust_phone" class="form-label">Customer Mobile Number</label>
                        <input type="text" class="form-control" id="cust_phone" name="cust_phone" :value="servicereq_selected.phone" readonly>
                    </div>
                    <div class="mb-3">
                        <label for="cust_addr" class="form-label">Customer Address</label>
                        <input type="text" class="form-control" id="cust_addr" name="cust_addr" :value="servicereq_selected.address" readonly>
                    </div>
                    <div class="mb-3">
                        <label for="cust_addr_link" class="form-label">Customer Address Link</label>
                        <input type="text" class="form-control" id="cust_addr_link" name="cust_addr_link" :value="servicereq_selected.address_link" readonly>
                    </div>
                    <div class="mb-3">
                        <label for="pincode" class="form-label">Pincode</label>
                        <input type="text" class="form-control" id="pincode" name="pincode" :value="servicereq_selected.pincode" readonly>
                    </div>
                    <!-- <input type="hidden" name="srvdreq_id" id="srvcreq_id" value=""> -->
                </div>
                <button type="button" :id="'approval_accepted_' + servicereq_selected.srvcreq_id" class="btn btn-outline-primary btn-sm" @click="submitApproval($event,'accepted')">Accept</button>
                <button type="button" :id="'approval_rejected_' + servicereq_selected.srvcreq_id" class="btn btn-outline-primary btn-sm" @click="submitApproval($event,'rejected')">Reject</button>
            </form>
        </div>
    </div>

  </div>
  `,
    data(){
        return {
            serviceRequestsPend : [],
            servicereq_selected : null
        }
    },
    methods: {
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
                this.serviceRequestsPend = data.data_prof;
                // console.log(data.data_prof)
                console.log("Pending Services fetched successfully.")
                // console.log(data.data)
              }
              else {
                  console.error("Failed to fetch Pending services:", data.message);
                }
              } 
            catch (error) {
              console.error("Error fetching services:", error);
            }
        },
        async submitApproval(event,approval){
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const form = event.target.closest("form");
            const srvcreq_id = this.servicereq_selected.srvcreq_id
            const button_acc = form.querySelector(`#approval_accepted_${this.servicereq_selected.srvcreq_id}`);
            const button_rej = form.querySelector(`#approval_rejected_${this.servicereq_selected.srvcreq_id}`);
            if(approval === 'accepted'){
              button_acc.disabled = true;
              button_rej.disabled = true
              // Change the button content
              button_acc.textContent = "Submiting Approval.....";
            }
            if(approval === 'rejected'){
              button_rej.disabled = true;
              button_acc.disabled = true
              // Change the button content
              button_rej.textContent = "Submiting Approval.....";
            }
              try{
                const response = await fetch(`/api/cust_srvcreq_approval/${srvcreq_id}/${approval}`, {
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
                    console.log("Updated.", data.message);
                    if(approval === 'accepted'){
                      button_acc.textContent = "Accepted";
                      this.servicereq_selected.srvc_status = 'accepted'
                    }
                    if(approval === 'rejected'){
                      button_rej.textContent = "Rejected";
                      this.servicereq_selected.srvc_status = 'rejected'
                    }
                    this.closeModal()
                }
                else {
                    console.error("Failed.", data.message);
                    window.location.reload();
                  }
                } 
              catch (error) {
                console.error("Error", error);
                window.location.reload();
              }
        },
        modalFunction(srvcreq){
          this.servicereq_selected = srvcreq;
            this.$nextTick(() => {
                const modal = document.getElementById('myModal_RequestDetails');
                if (modal) {
                    modal.style.display = 'block';
                } else {
                    console.error("Modal not found in DOM");
                }
            });
          // document.getElementById('myModal_RequestDetails').style.display = 'block';
          // document.getElementById('serviceCat_name').value=srvcreq.srvc_cat;
          // document.getElementById('service_name').value=srvcreq.srvc_name;
          // document.getElementById('cust_name').value=srvcreq.customer_name;
          // document.getElementById('srvc_status').value=srvcreq.srvc_status;
          // // document.getElementById('date_req').value=srvcreq.date_srvcreq;
          // document.getElementById('cust_phone').value=srvcreq.phone;
          // document.getElementById('cust_addr').value=srvcreq.address;
          // document.getElementById('cust_addr_link').value=srvcreq.address_link;
          // document.getElementById('pincode').value=srvcreq.pincode;
          // document.getElementById('srvcreq_id').value=srvcreq.srvcreq_id;
      },
    
      closeModal() {
          document.getElementById("myModal_RequestDetails").style.display = 'none'
          this.servicereq_selected = null
      },
    },


    mounted() {
        this.fetchServiceRequestsPend()
        localStorage.setItem("nav","Pending Professional Service Requests")
        // Emit an event for Navbar
        this.$root.$emit('login-success');
    }
})


export default ProfSrvcReqs;
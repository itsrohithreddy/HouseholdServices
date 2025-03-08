const AdminApprovals = Vue.component("AdminApprovalsComponent",{
    template:`
    <div>
    <!-- Pending Professional Approvals -->
    <h3>Pending Professional Approvals</h3>
    <div v-if="profRequestsPend.length" class="container AdminApprovalsComponent-container">
      <div v-for="prof in profRequestsPend" :key="prof.prof_userid" class="AdminApprovalsComponent-card card my-3">  
        <!-- Card Content -->
        <div class="card-content AdminApprovalsComponent-card-content">
            <div class="card-body AdminApprovalsComponent-card-body">
                <h5 class="AdminApprovalsComponent-card-title card-title">{{ prof.prof_category }}</h5>
                <p class="AdminApprovalsComponent-card-text card-text">
                    <strong>Service Name : </strong> {{ prof.prof_srvcname }}
                </p>
                <p class="AdminApprovalsComponent-card-text card-text">
                    <strong> Professional Name: </strong> {{ prof.prof_name }}
                </p>
                <!-- Action Buttons -->
                <div v-if="prof.prof_ver === 0">
                  <button class="btn btn-outline-primary btn-sm" @click="modalFunction(prof)">View</button>
                </div>
            </div>
        </div>
      </div>
    </div>

    <div v-else style="display: flex; flex-direction: column; align-items: center;text-align: center;">
        <h3>Pending Professional Approvals</h3>
        <p><span style="color:green">No Pending Approvals </span></p>
    </div>

    <div v-if="servicereq_selected" id="myModal_ProfessionalDetails" class="AdminApprovalsComponent-modal modal" style="position:fixed;top:15%;left:30%;width: 50%;height : 70%;max-width:500px;">
            <div class="AdminApprovalsComponent-modal-content modal-content" style="width: 100%">
              <span class="AdminApprovalsComponent-close" @click="closeModal()">&times;</span>
              
              <div class="container mt-5 d-flex align-items-start justify-content-center">
                <form class="form">
                    <div class="mb-3">
                        <div class="mb-3">
                            <label for="serviceCat_name" class="form-label">Service Category</label>
                            <input type="text" class="form-control" id="serviceCat_name" name="serviceCat_name" :value="servicereq_selected.prof_category" readonly>
                        </div>
                        <div class="mb-3">
                            <label for="service_name" class="form-label">Service Name</label>
                            <input type="text" class="form-control" id="service_name" name="service_name" :value="servicereq_selected.prof_srvcname" readonly>
                        </div>
                        <div class="mb-3">
                            <label for="prof_name" class="form-label">Professional Name</label>
                            <input type="text" class="form-control" id="prof_name" name="prof_name" :value="servicereq_selected.prof_name" readonly>
                        </div>
                        <div class="mb-3">
                            <label for="prof_gender" class="form-label">Professional Gender</label>
                            <input type="text" class="form-control" id="prof_gender" name="prof_gender" :value="servicereq_selected.prof_gender" readonly>
                        </div>
                        <div class="mb-3">
                            <label for="prof_age" class="form-label">Professional Age</label>
                            <input type="text" class="form-control" id="prof_age" name="prof_age" :value="servicereq_selected.prof_age" readonly>
                        </div>
                        <div class="mb-3">
                            <label for="prof_exp" class="form-label">Professional Experience</label>
                            <input type="text" class="form-control" id="prof_exp" name="prof_exp" :value="servicereq_selected.prof_exp" readonly>
                        </div>
                        <div class="mb-3">
                            <label for="prof_phone" class="form-label">Professional Mobile Number</label>
                            <input type="text" class="form-control" id="prof_phone" name="prof_phone" :value="servicereq_selected.prof_phone" readonly>
                        </div>
                        <div class="mb-3">
                            <label for="prof_dscp" class="form-label">Professional Description</label>
                            <input type="text" class="form-control" id="prof_dscp" name="prof_dscp" :value="servicereq_selected.prof_dscp" readonly>
                        </div>
                        <div class="mb-3">
                            <label for="prof_addr" class="form-label">Professional Address</label>
                            <input type="text" class="form-control" id="prof_addr" name="prof_addr" :value="servicereq_selected.prof_address" readonly>
                        </div>
                        <div class="mb-3">
                            <label for="prof_addr_link" class="form-label">Professional Address Link</label>
                            <input type="text" class="form-control" id="prof_addr_link" name="prof_addr_link" :value="servicereq_selected.prof_address_link" readonly>
                        </div>
                        <div class="mb-3">
                            <label for="pincode" class="form-label">Pincode</label>
                            <input type="text" class="form-control" id="pincode" name="pincode" :value="servicereq_selected.prof_address_pincode" readonly>
                        </div>
                        <!-- <input type="hidden" name="prof_id" id="prof_id" value=""> -->
                    </div>
                    <button :id="'approval_accepted_' + servicereq_selected.prof_userid" type="button" class="btn btn-outline-primary btn-sm" @click="submitApproval($event,'accepted')">Accept</button>
                    <button :id="'approval_rejected_' + servicereq_selected.prof_userid" type="button" class="btn btn-outline-primary btn-sm" @click="submitApproval($event,'rejected')">Reject</button>
                </form>
              </div>
            </div>
    </div>
    </div>
    `,
    data(){
        return {
            profRequestsPend : [],
            // apprl  : false,
            servicereq_selected : null
        }
    },
    methods: {
        async fetchProfessionalRequestsPend() {
            try {
            //   const user_id = this.$route.params.id || localStorage.getItem('user_id')
              const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            //   console.log("CSRF Token : ",csrfToken)
              const response = await fetch(`/api/pending_prof_approvals`, {
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
                this.profRequestsPend = data.data;
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
        async submitApproval(event,approval){
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const form = event.target.closest("form");
            const prof_id = this.servicereq_selected.prof_userid
            const button_acc = form.querySelector(`#approval_accepted_${this.servicereq_selected.prof_userid}`);
            const button_rej = form.querySelector(`#approval_rejected_${this.servicereq_selected.prof_userid}`);
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
                const response = await fetch(`/api/professional`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    'X-CSRF-Token': csrfToken
                  },
                  body: JSON.stringify({
                    'approval_status' : approval,
                    'prof_id' : prof_id
                  })
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
                      this.servicereq_selected.prof_ver = 1
                    }
                    if(approval === 'rejected'){
                      button_rej.textContent = "Rejected";
                      this.servicereq_selected.prof_ver = 1
                    }
                    this.closeModal();
                }
                else {
                    console.error("Failed.", data.message);
                    window.location.reload();
                  }
                } 
              catch (error) {
                console.error("Error", error.message);
                window.location.reload();
              }
        },
        modalFunction(prof){
          this.servicereq_selected = prof;
          this.$nextTick(() => {
              const modal = document.getElementById('myModal_ProfessionalDetails');
              if (modal) {
                  modal.style.display = 'block';
              } else {
                  console.error("Modal not found in DOM");
              }
          });
            // document.getElementById('myModal_ProfessionalDetails').style.display = 'block';
            // document.getElementById('serviceCat_name').value=prof.prof_category;
            // document.getElementById('service_name').value=prof.prof_srvcname;
            // document.getElementById('prof_name').value=prof.prof_name
            // document.getElementById('prof_gender').value=prof.prof_gender;
            // document.getElementById('prof_age').value=prof.prof_age
            // document.getElementById('prof_exp').value=prof.prof_exp;
            // document.getElementById('prof_phone').value=prof.prof_phone
            // document.getElementById('prof_dscp').value=prof.prof_dscp;
            // document.getElementById('prof_addr').value=prof.prof_address;
            // document.getElementById('prof_addr_link').value=prof.prof_address_link;
            // document.getElementById('pincode').value=prof.prof_address_pincode;
            // document.getElementById('prof_id').value=prof.prof_userid;
        },
      
        closeModal() {
            document.getElementById("myModal_ProfessionalDetails").style.display = 'none'
            this.servicereq_selected = null
        },
    },
    mounted() {
        this.fetchProfessionalRequestsPend()
    }

})

export default AdminApprovals;
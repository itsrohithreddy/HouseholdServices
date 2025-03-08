const AdminNavbar = Vue.component('AdminNavbarComponent', {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-info">
        <a class="navbar-brand" href="#"><i class="fa-brands fa-servicestack fa-2xl" style="color: #ffffff;"></i>HS</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav-collapse" aria-controls="nav-collapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="nav-collapse">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#"><i class="fa fa-fw fa-home fa-lg" style="color: #ffffff;"></i> Home</a>
            </li>
        </ul>
        <ul class="navbar-nav ms-auto">
            <li v-if="admin_loggedIn === '1'" class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Menu
                </a>
                <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                    <li><router-link class="dropdown-item" to="/admin_profApprovals">Pending Approvals</router-link></li>
                    <li><router-link class="dropdown-item" to="/srvcregister">Register Service Category</router-link></li>
                </ul>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Admin
                </a>
                <ul class="dropdown-menu" aria-labelledby="userDropdown">
                    <li v-if="admin_loggedIn === '1'">{{ admin_username }}</li>
                    <li v-if="admin_loggedIn === '1'">{{ admin_name }}</li>
                    <li><router-link class="dropdown-item" to="/">Home</router-link></li>
                    <li v-if="admin_loggedIn === '0'"><router-link class="dropdown-item" to="/admin_signin">Sign In</router-link></li>
                    <li v-if="admin_loggedIn === '1'"><router-link class="dropdown-item" to="/admin_signout">Sign Out</router-link></li>
                </ul>
            </li>
        </ul>
    </div>
  </nav>`,
  data(){
    return {
        admin_username: localStorage.getItem('admin_username') || '',
        admin_loggedIn: localStorage.getItem('admin_loggedIn') || '',
        admin_name: localStorage.getItem('admin_name') || ''
        // role: localStorage.getItem('role') || '',
        // user_id: localStorage.getItem('user_id') || ''
    }
  },
  created() {
    // Listen to the storage event
    // window.addEventListener('storage', this.updateFromLocalStorage);
    this.$root.$on('admin_login-success', this.updateFromLocalStorage);
  },
  destroyed() {
    // Clean up the event listener when the component is destroyed
    // window.removeEventListener('storage', this.updateFromLocalStorage);
    this.$root.$off('admin_login-success', this.updateFromLocalStorage);
  },
  methods: {
    updateFromLocalStorage() {
      // Update component data when localStorage changes
      this.admin_username = localStorage.getItem('admin_username') || '';
      this.admin_loggedIn = localStorage.getItem('admin_loggedIn') || '0';
      this.admin_name = localStorage.getItem('admin_name') || ''
    //   this.role = localStorage.getItem('role') || '';
    //   this.user_id = localStorage.getItem('user_id') || '';
    }
  }
});


export default AdminNavbar;
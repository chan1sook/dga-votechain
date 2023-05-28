export default {
  appName: "DGA E-Voting",
  navbar: {
    home: "Home",
    voting: "Voting",
    about: "About",
    help: "Help",
    contactUs: "Contact Us",
    adminShowUsers: "User Lists",
    blockchain: "Blockchain",
    login: "Login",
    language: "Current Language",
    news: {
      title: "News",
      loadingNews: "Loading...",
      noMoreNews: "No more news",
      loadMoreNews: "Load more news",
      add: "Add"
    },
    notification: {
      title: "Notifications",
      loadingNotifications: "Loading...",
      noMoreNotifications: "No more notifications",
      loadMoreNotifications: "Load more notifications",
    },
    user: {
      title: "User Info",
      welcome: "Welcome to E-Voting",
      anonymous: "Anonymous",
      switchRoleMode: "Switch mode to",
      desyncTime: "Desync time"
    },
    logout: "Logout"
  },
  privacyPolicy: {
    title: "Private Policy"
  },
  cookiePolicy: {
    title: "Cookie Policy"
  },
  notification: {
    topicStart: "Topic Started",
    requestPermission: {
      title: "Request Permission",
      inProgress: "in progress",
      approved: "approved",
      rejected: "rejected"
    }
  },
  home: {
    title: "Home",
    header: "DGA E-Voting Service on Blockchain"
  },
  about: {
    title: "About",
  },
  help: {
    title: "Help",
    pdf: "PDF",
    googleDocsVersion: "Google Docs Version",
  },
  contactUs: {
    title: "Contact Us",
    info: {
      address1: "Digital Government Development Agency (Public Organization) (DGA)",
      address2: "17th Floor, Bangkok Thai Tower Building 108 Rangnam Rd. Phayathai, Ratchatewi, Bangkok 10400, Thailand",
      tels: "Tel:",
      email: "Email:",
      contactCenter: "DGA Contact Center:",
    }
  },
  login: {
    title: "Login",
    loginDigitalId: "Login with Digital ID",
    loginWithGoogle: "Login with Google",
    registerDigitalId: "Register",
  },
  register: {
    firebase: {
      title: "Register with google account",
      token: "Token"
    },
    firstName: "First Name",
    lastName: "Last Name",
    citizenid: "Citizen ID",
    action: "Register",
    confirm: "Confirm your data?",
    success: "Register Successful",
    failed: "Register Failed",
  },
  role: {
    guest: "Guest",
    voter: "Voter",
    admin: "Admin",
    developer: "Developer",
  },
  voting: {
    title: "Voting",
    filters: {
      all: "All",
      date: "From Date",
      ticketId: "From Ticket Vote",
      topicName: "From Topic Question",
      ticketIdPlaceholder: "#Ticket Vote",
      topicNamePlaceholder: "Topic Question",
      search: "Go",
    },
    publicVote: "Public Vote",
    privateVote: "Private Vote",
    period: "Peroid",
    expired: "Close",
    createdBy: "Created by",
    voteOn: "Vote on",
    loadingTopic: "Loading...",
    loadMoreTopic: "Load more topics",
    noMoreTopic: "No more topic",
    createTopic: "Create",
    requestTopic: "Request",
    avaliableTopic: "All Avaliable",
    pendingTopic: "Check Pending",
    editTopic: "Edit",
    status: {
      waiting: "Waiting",
      result: "Result",
      access: "Access",
      voting: "Voting",
      voted: "Voted",
      finished: "Finished",
    },
    error: {
      title: "Error",
      waiting: "Topic is not ready to vote",
      notVoteable: "In progress. Wait until voting finished",
      waitResult: "Counting scores. Wait until finished",
    },
    back: "Back",
    now: "Now",
    localtime: "Local Time",
    remainVotes: "Remain",
    totalVotes: "Total",
    vote: "Vote | Votes",
    remainTimeVoting: "Time Remain for Voting",
    yourVote: "Your vote",
    voterVoted: "Voters",
    startVoteOn: "Start vote on",
    timeRemain: "Time Remaining",
    timePaused: "Time Paused",
    evoteState: {
      running: "E-voting is Running",
      paused: "E-voting is Paused",
    },
    adminWarning: "Please change mode to Voter for voting topic.",
    cannotVote: "Can't vote",
    pause: "Paused",
    resume: "Resume",
    clear: "Clear",
    noVote: "No Vote",
    submit: "Submit",
    confirm: "Confirm voting choices?"
  },
  topic: {
    request: {
      title: "Request Topic",
      action: "Request topic",
      confirm: "Confirm data to add?",
      success: 'Request topic successful',
      failed: 'Request topic failed',
    },
    create: {
      title: "Create Topic",
      action: "Add topic",
      confirm: "Confirm data to add?",
      success: 'Add topic successful',
      failed: 'Add topic failed',
    },
    edit: {
      title: "Edit Topic",
      action: "Edit topic",
      confirm: "Confirm data to edit?",
      success: 'Edit topic successful',
      failed: 'Edit topic failed',
    },
    error: {
      notFound: "Topic not found",
      notEditable: "Topic not editable"
    },
    accessModifier: "Access Type",
    publicVoteAccess: "Public Vote",
    privateVoteAccess: "Private Vote",
    voteDuration: {
      title: "Vote Duration",
      inputMode: "Input Mode",
      mode: {
        startDuration: "Start/Duration",
        startEnd: "Start/End",
      },
      start: "Start Vote",
      duration: "Duration",
      end: "End Vote",
      startDate: "Start Date",
      endDate: "End Date",
      startTime: "Start Time",
      endTime: "Start Time",
    },
    topicQuestion: "Topic Question",
    description: {
      title: "Description",
      add: "Add Description",
      hide: "Hide Description"
    },
    addChoice: {
      title: "Add Choice",
      add: "Add Choice",
      remove: "Remove Choice",
      error: {
        empty: "Choice must not empty",
        duplicated: "Choice Duplicated"
      }
    },
    voterList: {
      title: "Voter Lists",
      multipleVotes: "Multiple Votes",
      totalVotes: "Total Votes",
      userId: "User ID",
      name: "Name",
      add: "Add User",
      remove: "Remove User",
      searchUser: "Search User",
      error: {
        duplicated: "Duplicated User"
      }
    },
    coadminList: {
      title: "Co-Admin Lists",
      userId: "User ID",
      name: "Name",
      add: "Add User",
      remove: "Remove User",
      searchUser: "Search User",
      error: {
        duplicated: "Duplicated User"
      }
    },
    notifyUsers: "Send notice to users",
    showScores: "Show Scores on result",
    skipBlockchain: "Not record to Blockchain",
    scorePublic: "Display voter choice(s) for public",
    allow: "Allow",
    deny: "Deny",
  },
  result: {
    title: "Voting Result",
    ticketid: "Ticket ID",
    description: {
      title: "Description",
      show: "Show Description",
      hide: "Hide Description",
    },
    winners: "Winners",
    stats: "Stats",
    noVoted: "No Voted",
    total: "Total",
    notIncludeNoVote: "Not include No Vote",
    winner: "Winner",
    yourChoice: "Your Choice",
    showVoteLogs: "Show Vote Logs",
    voteLogs: "Vote Logs",
    export: "Export Result",
  },
  news: {
    title: "News",
    id: "News ID",
    create: {
      title: "Create News",
      confirm: "Confirm Create News?",
      action: "Create News",
      success: "Create News Successful",
      failed: "Create News Failed",
    },
    edit: {
      title: "Edit News",
      confirm: "Confirm Edit News?",
      action: "Edit News",
      success: "Edit News Successful",
      failed: "Edit News Failed",
    },
    required: "Required",
    newsTitle: "Title",
    author: "Author",
    content: "Content",
    references: "References",
    publishAt: "Publish At",
    publishTime:  {
      title: "Publish",
      date: "Publish date",
      time: "Publish time",
    },
    newsExpired: "Expired",
    expiredTime: {
      date: "Expired Date",
      time: "Expired Time",
    },
    anonymous: "Anonymous",
    noReference: "No References"
  },
  requestPermissions: {
    add: {
      title: "Add Request Permissions",
      noteToApprover: "Note",
      requestTo: {
        title: "Request to",
        moderator: "Moderator",
        developer: "Developer"
      },
      allowConsent: "Allow to use personal Data for approver",
      action: "Add Request",
      success: "Add Request Successful",
      failed: "Add Request Failed",
      pendingBlocked: "Please wait before request again",
    },
    change: {
      title: "Change Permissions",
      action: "Change",
      confirm: "Confirm to Change Permissions?",
      success: "Change Permissions Successful",
      failed: "Change Permissions Failed",
    },
    permissions: "Permissions",
    note: "Note",
    noteNone: "None",
    approveRequestPermissions: "Approve Request Permission",
    requestsNotFound: "Requests not found",
    approve: "Approve",
    manageApproveList: "Manage Approve List",
    reject: "Reject",
    userid: "User ID",
    personalData: "Personal Data",
    citizenid: "Citizen ID",
    name: "Name",
    email: "Email"
  },
  permissions: {
    "request-permissions": "Request More Permissions",
    "voter-mode": "Access Voter Mode",
    "admin-mode": "Access Admin Mode",
    "dev-mode": "Access Developer Mode",
    "vote-topic": "Vote Topics",
    "create-topic": "Create New Topics",
    "change-topic": "Change Topic Data",
    "change-permissions:basic": "Change Basic Permissions",
    "change-permissions:advance": "Change Advance Permissions",
  },
  admin: {
    user: {
      title: "User List",
      changePermissions: "Change Permissions",
      showAllUsers: "Show All Users",
    },
    blockchain: {
      title: "Blockchain Admin",
      blockInfo: {
        title: "Block Info",
        total: "Total",
        mined: "Confirmed",
        pending: "Pending",
        invalid: "Invalid",
      },
      serverStatus: {
        title: "Server Status",
        total: "Total",
        online: "Online",
        offline: "Offline",
      },
      searchTx: "Search TX",
      txhash: "TX Hash",
      voteid: "Vote ID",
      txInfo: "Tx Info",
      liveTxUpdate: "Live TX Update",
      type: {
        title: "Type",
        vote: "Vote",
        result: "Vote Result"
      },
      createdAt: "Created At",
      status: "Status",
      detail: "Detail",
      transactionData: "TX Data",
      transactionRawData: "Raw TX Data",
    },
  },
  timePeriod: {
    nearZeroMinute: "Less than a minute",
    minute: "Mins",
    hour: "Hours",
    day: "Days",
  },
  modal: {
    cancel: "Cancel",
    confirm: "Confirm"
  },
  error: {
    title: "Error",
    backToHome: "Back to Home"
  },
  loading: "Loading",
  cookieConsent: {
    useCookie: "This website use cookies",
    acceptAll: "Accept All",
    acceptRequiredOnly: "Accept Required-Only",
  }
}
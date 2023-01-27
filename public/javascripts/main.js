let imageCapture;
let avatarBlob;
let qrBlob;

function drawCanvas(canvas, img) {
  canvas.width = getComputedStyle(canvas).width.split('px')[0];
  canvas.height = getComputedStyle(canvas).height.split('px')[0];
  let ratio  = Math.min(canvas.width / img.width, canvas.height / img.height);
  let x = (canvas.width - img.width * ratio) / 2;
  let y = (canvas.height - img.height * ratio) / 2;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
      x, y, img.width * ratio, img.height * ratio);
}

async function takeSnapshots() {
  try {
    imageBitmap = await imageCapture.grabFrame();
    const canvas = document.getElementById('snapshots');
    drawCanvas(canvas, imageBitmap);
  } catch(err) {
    console.log(err)
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const uripath = window.location.href; // returns the full URL

  if (/register/.test(uripath)) {
    document.getElementById('register').classList.add('active');
  } else if (/vote/.test(uripath)) {
    document.getElementById('vote').classList.add('active');
  } else if (/results/.test(uripath)) {
    document.getElementById('results').classList.add('active');
  } else if (/admin/.test(uripath)) {
    document.getElementById('admin').classList.add('active');
  }

  initAdminTable();

  const takeSnapshotBtn = document.getElementById("take_snapshots");
  const registerBtn = document.getElementById("register_btn");
  if(takeSnapshotBtn) {
    // only use when has has take snapshot
    navigator.mediaDevices.getUserMedia({video: true})
    .then(mediaStream => {
      document.querySelector('video').srcObject = mediaStream;

      const track = mediaStream.getVideoTracks()[0];
      imageCapture = new ImageCapture(track);
      takeSnapshotBtn.removeAttribute("hidden");
    })
    .catch(error => console.log(error));
    takeSnapshotBtn.addEventListener("click", async () => {
      await takeSnapshots();
      document.getElementById("camera").style.display = "none";
      document.getElementById("take_snapshots").style.display = "none";
      document.getElementById("snapshots").style.display = "block";
      
      registerBtn.disabled = false;
      addImageBlob();
    
      const mediaStream = document.querySelector('video').srcObject;
      const tracks = mediaStream.getTracks();
      for(const track of tracks) {
        track.stop();
      }
    })
  }

  initRegisterPage();
  initVotePage();
  initVoteTopicPage();
  initResultPage();
})

function addImageBlob() {
  const canvas = document.getElementById("snapshots");
  canvas.toBlob((imageData) => {
    avatarBlob = imageData;
  });
};

function initRegisterPage() {
  const registerForm = document.getElementById("register_form");
  if(registerForm) {
    registerForm.addEventListener("submit", async (ev) => {
      ev.preventDefault();

      if(!avatarBlob) {
        return;
      }

      const formData = new FormData(document.getElementById("register_form"));
      formData.set("avatar", avatarBlob);

      const regNow = document.getElementById("register_row");
      regNow.innerHTML = `<div class="col-md-12">
        <div class="jumbotron jumbotron-fluid">
          <div class="container">
            <h1 class="display-4 text-center reg-header-result">Registration</h1>
            <p class="lead text-center reg-result">
            Please Wait
            </p>
            <div class="reg-loading">
              <div class="lds-css ng-scope"><div style="width:100%;height:100%" class="lds-ellipsis"><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>`;

      try {
        const res = await fetch("/register", {
          method: 'POST',
          body: formData
        });

        if(res.status >= 400) {
          throw new Error("Register Failed");
        }

        regNow.getElementsByClassName("reg-header-result")[0].innerHTML = "Registration Completed";
        regNow.getElementsByClassName("reg-loading")[0].remove();

        const regResult = regNow.getElementsByClassName("reg-result")[0];
        regResult.innerHTML = "Your QR Code";
        
        const qrBlob = await res.blob()
        const qrBlobLink = URL.createObjectURL(qrBlob);
        const imgDOM = document.createElement("img");
        imgDOM.classList.add("d-block", "mx-auto");
        imgDOM.src = qrBlobLink;
        
        const linkWrapper = document.createElement("div");
        const linkURL = document.createElement("a");
        linkURL.innerHTML = "Download QR Code";
        linkURL.href=qrBlobLink;
        linkURL.download = `Voter_QR.png`;
        linkWrapper.classList.add("text-center");
        linkWrapper.append(linkURL);

        regResult.parentElement.append(imgDOM, linkWrapper);
      } catch(err) {
        console.error(err);

        regNow.getElementsByClassName("reg-header-result")[0].innerHTML = "Registration Failed";
        regNow.getElementsByClassName("reg-loading")[0].remove();
        
        const regResult = regNow.getElementsByClassName("reg-result")[0];
        const tryAgainBtn = document.createElement("button");
        tryAgainBtn.innerHTML = `Try Again`;
        tryAgainBtn.classList.add("btn", "btn-success", "btn-lg", "btn-block");
        tryAgainBtn.addEventListener("click", () => {
          location.reload();
        })
        regResult.parentElement.append(tryAgainBtn);
        regResult.remove();
      }
    });
  }
}

function initAdminTable() {
  const voterTable = document.getElementById("voter_table");

  if(voterTable) {
    let topicChoices = [];
    let table_view_btn_flag = false;

    const topicTable = document.getElementById("topic_table");
    const topicAddForm = document.getElementById("topic_add_form");
    const tableToggleBtn = document.getElementById("table_view_btn");

    function toggleTableView() {
      if (table_view_btn_flag) {
        voterTable.style.display = "none";
        topicTable.style.display = "block";
        topicAddForm.style.display = "none";
        table_view_btn_flag = false;
      } else {
        voterTable.style.display = "block";
        topicTable.style.display = "none";
        topicAddForm.style.display = "none";
        table_view_btn_flag = true
      }
    }
    
    tableToggleBtn.addEventListener("click", toggleTableView);
    toggleTableView();

    const topicModalBtn = document.getElementById("topicModalBtn");
    if(topicModalBtn) {
      const nameInput = document.getElementById("name");
      const expiredDateInput = document.getElementById("expired-date");
      const expiredTimeInput = document.getElementById("expired-time");
      const choiceInput = document.getElementById("choice");
      const topicAddForm = document.getElementById("topic_add_form");
      const topicChoicesEdit = document.getElementById("topic_choices_edit");
      const topicChoiceAddBtn = document.getElementById("topic_choice_add");

      topicModalBtn.addEventListener("click", () => {
        topicTable.style.display = "none";
        topicChoices = [];
        updateTopicModalUi();
        topicAddForm.style.display = "block";
      })

      function getExpiredTime() {
        const date = expiredDateInput.value;
        const time = expiredTimeInput.value;
        const value = new Date(`${date}T${time}`);

        return isNaN(value.valueOf()) ? null : value;
      }

      function validateTopicChoices() {
        if(topicChoices.length < 2) {
          return false;
        }

        const expired = getExpiredTime();

        return nameInput.value !== "" && expired && expired.valueOf() > Date.now();
      }

      function updateTopicModalUi() {
        const isValid = validateTopicChoices();
        document.getElementById("topic_add_btn").disabled = !isValid;
        topicChoiceAddBtn.disabled = choiceInput.value == "" || topicChoices.includes(choiceInput.value);

        topicChoicesEdit.innerHTML = ""; 
        for(const choice of topicChoices) {
          const dom = document.createElement("div");
          dom.classList.add("d-flex", "flex-wrap", "my-2");
          dom.innerHTML = `<div class="mr-auto">${choice}</div>`;
          
          const btn = document.createElement("button");
          btn.type = "button";
          btn.innerHTML = `Remove`;
          btn.classList.add("btn", "btn-danger");
          btn.addEventListener("click", () => {
            topicChoices = topicChoices.filter((ele) => ele !== choice);
            updateTopicModalUi();
          }, {once: true});

          dom.append(btn);

          topicChoicesEdit.append(dom);
        }
      }
      
      nameInput.addEventListener("input", updateTopicModalUi);
      expiredDateInput.addEventListener("change", updateTopicModalUi);
      expiredTimeInput.addEventListener("change", updateTopicModalUi);
      choiceInput.addEventListener("input", updateTopicModalUi);

      topicAddForm.addEventListener("submit", async (ev) => {
        ev.preventDefault();

        if(!validateTopicChoices()) {
          return;
        }

        const formData = new FormData(topicAddForm);
        formData.append("choices", JSON.stringify(topicChoices));
        formData.append("expired", getExpiredTime().valueOf());

        try {
          await fetch("/admin/addtopic", {
            method: "POST",
            body: formData,
          });

          location.reload();
        } catch(err) {
          console.error(err);
          alert(err.message);
        }
      });

      topicChoiceAddBtn.addEventListener("click", () => {
        if(choiceInput.value == "" || topicChoices.includes(choiceInput.value)) { return; }
        topicChoices.push(choiceInput.value);
        updateTopicModalUi();
      })
    }
  }
}

async function initVotePage() {
  const topicSelectDiv = document.getElementById("select_topic_div");

  if(topicSelectDiv) {
    const spinner = document.getElementsByClassName("lds-spinner")[0];
    const txtMsg = document.getElementById("txtmsg");
    const qrImg = document.getElementById("qr_img");
    const topicSelect = document.getElementById("topic_select");
    const topicSelectBtn = document.getElementById("select_topic_btn");
    const uploadQrBtn = document.getElementById("upload_qr");
    const submitQrBtn = document.getElementById("submit_qr");
    const captureImgBtn = document.getElementById("capture_img");
    const cameraDOM = document.getElementById("camera");

    try {
      const res = await fetch("/fetchtopics?expired=nonexpired");
      const json = await res.json();
      
      if(!Array.isArray(json.topics) || json.topics.length === 0) {
        throw new Error("No topic left");
      }

      topicSelect.innerHTML = "";
      for(const ele of json.topics) {
        const optionDOM = document.createElement("option");
        optionDOM.innerHTML = ele.name;
        optionDOM.value = ele._id;
        topicSelect.append(optionDOM);
      }

      topicSelectBtn.style.display = "block";
      topicSelectBtn.addEventListener("click", () => {
        spinner.style.display = "block";
        uploadQrBtn.style.display = "block";
        topicSelectDiv.style.display = "none";
        txtMsg.innerHTML = "Please upload your QR Code below";
      });

      uploadQrBtn.addEventListener("change", (event) => {
        spinner.style.display = "none";
        
        const reader = new FileReader();
        reader.onload = function () {
          qrImg.src = reader.result;
          uploadQrBtn.style.display = "none";
          submitQrBtn.style.display = "block";
          qrBlob = document.getElementById("qr_file").files[0];
          alert("QR Code Uploaded");
        };
        reader.readAsDataURL(event.target.files[0]);
      });

      submitQrBtn.addEventListener("click", () => {
        qrImg.style.display = "none";
        txtMsg.innerHTML = "Capture your face to verify your identity";
        submitQrBtn.style.display = "none";

        // show camera
        navigator.mediaDevices.getUserMedia({video: true})
          .then(mediaStream => {
            document.querySelector('video').srcObject = mediaStream;
      
            const track = mediaStream.getVideoTracks()[0];
            imageCapture = new ImageCapture(track);
      
            cameraDOM.style.display = "block";
            captureImgBtn.style.display = "block";
          });
      })

      captureImgBtn.addEventListener("click", async () => {
        const snapshotDOM =  document.getElementById("snapshots");
        const verifyBtn =  document.getElementById("verify_btn");

        await takeSnapshots();
        cameraDOM.style.display = "none";
        captureImgBtn.style.display = "none";
        snapshotDOM.style.display = "block";
        verifyBtn.style.display = "block";

        addImageBlob();
      
        const mediaStream = document.querySelector('video').srcObject;
        const tracks = mediaStream.getTracks();
        for(const track of tracks) {
          track.stop();
        }

        verifyBtn.addEventListener("click", async () => {
          if(!avatarBlob || !qrBlob) { return; }
          
          const formData = new FormData(document.getElementById("verify_form"));
          formData.set("avatar", avatarBlob);
          formData.set("qr", qrBlob);
          formData.set("topic", topicSelect.value);
          
          snapshotDOM.style.display = "none";
          verifyBtn.style.display = "none";
      
          try {
            const res = await fetch("/verifyvoter", {
              method: 'POST',
              body: formData
            });
      
            const result = await res.json();
      
            if(res.status >= 400) {
              throw new Error(result.message || "Verify Failed");
            }
      
            txtMsg.innerHTML = "Validation Success";
            location.href = "/votetopic";
          } catch(err) {
            console.error(err);
            txtMsg.innerHTML = "Validation Failed";
          }
        });
      })
    } catch(error) {
      console.error(error);
      topicSelectDiv.innerHTML = `${error.message}`;
    }
  }
}

function initVoteTopicPage() {
  const voteBtn = document.getElementById("vote_btn");

  if(voteBtn) {
    const radios = document.getElementsByClassName("vote_topic_radio");

    function getChoice() {
      for(const radio of radios) {
        if(radio.checked) {
          return parseInt(radio.value, 10);
        }
      }

      return null;
    }

    function updateUi() {
      voteBtn.disabled = typeof getChoice() !== "number";
    }

    updateUi();

    for(const radio of radios) {
      radio.addEventListener("click", updateUi);
    }

    voteBtn.addEventListener("click", async () => {
      const choice = getChoice();
      if(typeof getChoice() !== "number") {
        return;
      }

      for(const radio of radios) {
        radio.disabled = true;
      }
      voteBtn.disabled = true;

      const formData = new FormData();
      formData.append("topic", document.getElementById("topicId").value);
      formData.append("id", document.getElementById("id").value);
      formData.append("choice", `${choice}`);

      try {
        const res = await fetch("/votetopic", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
      
        if(res.status >= 400) {
          throw new Error(result.message || "Can't vote");
        }

        alert("Voted!");
        location.href = "/";
      } catch(error) {
        console.error(error);
        alert(error.message);

        location.href = "/vote";
      }

    
      // if (voteflag == true) {
      //   contractInstance.voteForCandidate(candidateName, {
      //     from: web3.eth.accounts[0]
      //   }, function () {
      //     console.log(contractInstance.totalVotesFor.call(candidateName).toString());
      //     window.location = "/voteadded/" + id;
      //   });
      // }
    }, { once: true })
  }
}

async function initResultPage() {
  const topicSelectDiv = document.getElementById("result_topic_select");
  
  if(topicSelectDiv) {
    const topicSelect = document.getElementById("topic_select");
    const refreshBtn = document.getElementById("refresh");

    async function reloadTopicResult(id) {
      const chartDOM = document.getElementById('chart-area');
      const ctx = chartDOM.getContext('2d');

      try {
        const res = await fetch(`/fetchtopicresult/${id}`);
        const json = await res.json();
        
        const filterResults = json.result.filter((ele) => ele.nth !== 0); 
        const total = json.result.reduce((prev, current) => {
          return prev + current.count;
        }, 0);
        
        const chartConfig = {
          type: 'doughnut',
          data: {
            datasets: [{
              data: filterResults.map((ele) => ele.count),
              label: json.final ? "Result" : "Result (Not Final)",
            }],
            labels: filterResults.map((ele) => ele.choice)
          },
          options: {
            responsive: true,
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: json.name
            },
            animation: {
              animateScale: true,
              animateRotate: true
            },
            plugins: {
              colorschemes: {
                  scheme: 'brewer.Paired12'
              }
          }
          }
        }
        
        if(!window.resultChart) {
          window.resultChart = new Chart(ctx, chartConfig);
        } else {
          window.resultChart.data = chartConfig.data;
          window.resultChart.options = chartConfig.options;
          window.resultChart.update();
        }
      } catch(error) {
        console.error(error);
      }
    }

    try {
      const res = await fetch("/fetchtopics?expired=all");
      const json = await res.json();

      if(!Array.isArray(json.topics) || json.topics.length === 0) {
        throw new Error("No topic left");
      }


      topicSelect.innerHTML = "";
      for(const ele of json.topics) {
        const optionDOM = document.createElement("option");
        optionDOM.innerHTML = ele.name;
        optionDOM.value = ele._id;
        topicSelect.append(optionDOM);
      }

      topicSelectDiv.style.display = "block";
      refreshBtn.addEventListener("click", () => {
        reloadTopicResult(topicSelect.value);
      })
      topicSelect.addEventListener("change", () => {
        reloadTopicResult(topicSelect.value);
      })

      reloadTopicResult(topicSelect.value);
    } catch(error) {
      console.error(error);
    }
  }
}
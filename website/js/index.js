// 上传文件 获取文件名称 显示文件目录
// 新建分类
// 点击展开和收起文件夹
(function () {
  // 标记是否新建分类
  let createFolderFlag = false
  let newFolderName = ''

  // 新建分类
  const newIpt = document.querySelector('.nav .new-ipt')
  const iptModalDom = document.querySelector('#categoryInputModal')
  const iptModal = new bootstrap.Modal(iptModalDom)
  const fileNameIptSure = document.querySelector('.categoryIptSure')
  const fileShow = document.querySelector('.fileShow .show')

  const alertModalDom = document.querySelector('#alertModal')
  const alertModal = new bootstrap.Modal(alertModalDom)

  newIpt.addEventListener('click', () => {
    // console.log('newipt');
    iptModal.show()
    fileNameIptSure.addEventListener('click', createFolder)
  })

  async function createFolder() {
    createFolderFlag = true

    // 获取表单内的名字数据
    // 创建文件夹
    // console.log('sure');
    const input = document.querySelector('#categoryInputModal #category-name-ipt')
    // console.log(input.value);
    newFolderName = input.value

    const res1 = await axios({
      method: 'post',
      url: `/dir/${newFolderName}`,
    })
    console.log('文件夹创建成功:', res1);

    fileShow.innerHTML += `
        <div class="originImg img-folder">
          <div class="folder">
            <div class="icon icon-off" data-folderid="${document.querySelectorAll('.img-folder').length + 1}"></div>
            <div class="folder-name">${newFolderName}</div>
          </div>
        </div>
      `
    iptModal.hide()
    input.value = ''
    fileNameIptSure.removeEventListener('click', createFolder)
  }

  // 上传文件夹
  const folder = document.querySelector('.folder-ipt')
  folder.addEventListener('click', (e) => {
    if (createFolderFlag === false) {
      e.preventDefault()  // 阻止默认事件

      // 显示弹窗 先新建分类
      alertModal.show()

    } else {
      folder.addEventListener('change', changeFiles)
    }
  })

  async function changeFiles(e) {
    console.log(e.target.files);
    const files = e.target.files
    await uploadFiles(files)
    uploadFinishFlag = true
    // 上传完后获取文件夹和文件名字并显示
    // 获取所有文件夹名称
    await getDirName()

    createFolderFlag = false
    folder.removeEventListener('change', changeFiles)
  }

  async function uploadFiles(files) {
    // 上传文件
    let uploadPromises = []
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData()
      fd.append('files', files[i])
      fd.append('dirname', newFolderName)
      fd.append('filename', files[i].name)

      try {
        // 上传文件
        const res = axios({
          method: 'post',
          url: '/raw_file',
          data: fd
        });
        // console.log('文件上传成功2:', res);
        uploadPromises.push(res)
      } catch (err) {
        console.log('上传文件出错:' + err);
      }
    }
    await Promise.all(uploadPromises)
  }

  async function getDirName() {
    // if (uploadFinishFlag===false){
    //   return
    // }
    const res = await axios({
      method: 'get',
      url: '/dir'
    })
    console.log(res.data.dirs);
    // 文件夹
    const folderData = await Promise.all(res.data.dirs.map(async (item, index) => {
      const filesname = await axios({
        method: 'get',
        url: `/dir/${item}`
      })
      // console.log(filesname.data.files);
      const ul = '<ul>' +
        filesname.data.files.map(item => {
          return `<li>${item}</li>`
        }).join("")
        + "</ul>"
      const dirName = item

      return `
          <div class="originImg img-folder">
            <div class="folder" data-folderid=${index + 1}>
              <div class="icon icon-off" data-folderid=${index + 1}></div>
              <div class="folder-name" data-folderid=${index + 1}>${dirName}</div>
            </div>
            <div class="fo-file">
              ${ul}
            </div>
          </div>
        `
    }))
    document.querySelector('.fileShow .show').innerHTML = folderData.join("")
  }
  getDirName()

  const imgFolder = document.querySelectorAll('.show')

  // 点击展开和收起文件夹
  imgFolder.forEach(item => {
    item.addEventListener('click', (e) => {
      let nowTarget = e.target
      const folderId = e.target.dataset.folderid
      console.log(folderId);
      if (e.target.classList.contains('folder')) {
        nowTarget = e.target.querySelector('.icon')
        console.log('if1', nowTarget);
      } else if (e.target.classList.contains('folder-name')) {
        nowTarget = e.target.previousElementSibling
        console.log('if2', nowTarget);
      }
      // 切换图标
      if (nowTarget.classList.contains('icon')) {
        if (nowTarget.classList.contains('icon-on')) {
          nowTarget.classList.remove('icon-on')
          nowTarget.classList.add('icon-off')
          nowTarget.innerHTML = '' // 关闭图标
        }
        else if (nowTarget.classList.contains('icon-off')) {
          nowTarget.classList.remove('icon-off')
          nowTarget.classList.add('icon-on')
          nowTarget.innerHTML = ''
        }
      }

      // 显示 隐藏文件夹
      const nowFolder = document.querySelectorAll('.fo-file')[folderId - 1]
      if (nowTarget.classList.contains('icon-on')) {
        nowFolder.style.display = 'block'
      } else if (nowTarget.classList.contains('icon-off')) {
        nowFolder.style.display = 'none'
      }
    })
  })
}());



// 点击文件获取图片
(function () {
  let fusionFlag = false
  const fileShow = document.querySelector('.fileShow')
  fileShow.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      const LIs = document.querySelectorAll('.fo-file ul li')
      LIs.forEach(item => {
        item.style.backgroundColor = "transparent"
      })
      e.target.style.backgroundColor = "rgba(0,0,0,.1)"
      const img = document.querySelector('.workImg .box img')

      // 清空画板
      const canvas = document.querySelector('.drawingCanvas')
      canvas.width = canvas.width
      img.src = ""

      // 获取图片名字和所在文件夹名字
      const imgName = e.target.innerHTML
      const folderName = e.target.parentNode.parentNode.previousElementSibling.querySelector('.folder-name').innerHTML
      // 发起请求
      axios({
        method: 'get',
        url: `/dir/${folderName}/file/${imgName}`
      }).then(res => {
        console.log(res);

        if (res.data.raw && res.data.mask === undefined) {
          // 如果返回数据中只有raw的路径 直接显示图片
          img.src = res.data.raw
        } else if (res.data.raw && res.data.mask) {
          // 如果返回数据中有raw和mask的路径 结合两个显示
          imageFusion(res.data.raw, res.data.mask)
        }
      }).catch(err => {
        console.log(err);
      })
    }
  })

  function imageFusion(raw, mask) {
    // 设置原图
    const workImg = document.querySelector('.workImg .box img')
    workImg.src = raw
    // 原图加载成功后设置mask
    fusionFlag = true
    workImg.onload = function () {
      if (fusionFlag === false)
        return
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = 400
      tempCanvas.height = 400
      const tempCtx = tempCanvas.getContext('2d')

      const canvas = document.querySelector('.drawingCanvas')
      // console.log(canvas);
      const ctx = canvas.getContext('2d')

      const img = new Image()
      img.src = mask
      // console.log(img);
      img.onload = function () {
        tempCtx.drawImage(img, 0, 0, 400, 400)

        const imgData = tempCtx.getImageData(0, 0, 400, 400)
        for (let i = 0; i < imgData.data.length; i += 4) {
          if (imgData.data[i] === 255
            && imgData.data[i + 1] === 0
            && imgData.data[i + 2] === 0) {
            imgData.data[i] = 232
            imgData.data[i + 1] = 177
            imgData.data[i + 2] = 164
            imgData.data[i + 3] = 255 * 0.6
          } else {
            imgData.data[i] = 255
            imgData.data[i + 1] = 255
            imgData.data[i + 2] = 255
            imgData.data[i + 3] = 0
          }
        }
        ctx.putImageData(imgData, 0, 0)
        // ctx.drawImage(tempCanvas, 0, 0);
      }
      fusionFlag = false
    }
  }
}());

// 点击展开收起文件栏
(function () {
  const icoLeft = document.querySelector('.ico-left')
  const icoRight = document.querySelector('.ico-right')
  icoLeft.addEventListener('click', () => {
    document.querySelector('.fileShow').style.display = 'none'
    icoLeft.style.display = 'none'
    icoRight.style.display = 'block'
  })
  icoRight.addEventListener('click', () => {
    document.querySelector('.fileShow').style.display = 'block'
    icoLeft.style.display = 'block'
    icoRight.style.display = 'none'
  })
}());

// 拖拽移动操作栏
(function () {
  const btnsTop = document.querySelector(".buttons .btnsTop")
  const buttons = document.querySelector('.buttons')
  const btnsAutoTop = document.querySelector('.buttons-autoMode .btnsTop')
  const buttonsAuto = document.querySelector('.buttons-autoMode')
  const all = document.querySelector('*')

  // 鼠标在元素上按下开始拖拽
  btnsTop.onmousedown = function (event) {
    drag(event, buttons, btnsTop)
  }
  btnsAutoTop.onmousedown = function (event) {
    drag(event, buttonsAuto, btnsAutoTop)
  }

  function drag(event, buttons, btnsTop) {
    // 获取按下鼠标时 盒子与页面的距离
    all.style.userSelect = 'none'
    let originBoxX = buttons.offsetLeft;
    let originBoxY = buttons.offsetTop;
    // console.log(originBoxX, originBoxY);
    // 获取按下鼠标时 鼠标与页面的距离
    let mouseX = event.pageX;
    let mouseY = event.pageY;
    // console.log(mouseX, mouseY);
    // 在页面上移动
    window.onmousemove = function (event) {
      // 鼠标滑动的距离 = 鼠标移动后的位置 - 按下鼠标时的位置
      let distanceX = event.pageX - mouseX;
      let distanceY = event.pageY - mouseY;
      let left = originBoxX + distanceX
      let top = originBoxY + distanceY
      // console.log(workSpace.offsetLeft, workSpace.offsetTop, left, top, wsTop.style.height);
      if (left >= 0 && top >= 50) {
        // 给元素重新赋值 上左定位的位置
        buttons.style.left = originBoxX + distanceX + "px";
        buttons.style.top = originBoxY + distanceY + "px";
      }

    }
    // 鼠标松开取消事件
    btnsTop.onmouseup = function () {
      // 解绑在页面上滚动的事件
      window.onmousemove = null;
      // console.log('up');
      all.style.userSelect = 'text'
    }
  }
}());


// 切换操作模式
(function () {
  // 0 手动标注模式
  // 1 自动标注模式
  let mode = 1
  const toggle = document.querySelector('.nav .toggle')
  // console.log(toggle);
  toggle.addEventListener('click', (e) => {
    if (mode === 0) {
      // 切换自动标注模式
      mode = 1
      document.querySelector('.wsTop').innerHTML = '操作区域（自动标注模式）'
      document.querySelector('.buttons').style.display = 'none'
      document.querySelector('.buttons-autoMode').style.display = 'block'


    } else {
      // 切换手动标注模式
      mode = 0
      document.querySelector('.wsTop').innerHTML = '操作区域（手动标注模式）'
      document.querySelector('.buttons').style.display = 'block'
      document.querySelector('.buttons-autoMode').style.display = 'none'

      // 发送请求到服务器更改操作模式
      axios({
        method: 'put',
        url: '/manual'
      }).then(res => {
        console.log(res);
      }).catch(err => {
        console.log(err);
      })
    }
  })

  const autoModeBtn = document.querySelector('.autoMode')
  autoModeBtn.addEventListener('click', () => {
    // 发送请求到服务器更改操作模式
    axios({
      method: 'put',
      url: '/auto'
    }).then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
    })
  })
}());





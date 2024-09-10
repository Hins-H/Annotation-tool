// 手动标注图像处理
(function () {
  const canvas = document.querySelector('.drawingCanvas')
  let ctx = canvas.getContext('2d', {
    willReadFrequently: true,
  })
  const rbImgCanvas = document.querySelector('.rbImg canvas')
  let ctx2 = rbImgCanvas.getContext('2d')

  const mouseArrow = document.querySelector('.mouse')
  const box = document.querySelector('.box')
  const line = document.querySelector('.line')
  const Vertical = document.querySelector('.Vertical')

  // const getBoundingBtn = document.querySelector('.getBounding')
  const drawBtn = document.querySelector('.draw')
  const wipeBtn = document.querySelector('.wipe')
  const scrawlBtn = document.querySelector('.scrawl')
  const copyBtn = document.querySelector('.copy')

  const drawModalDom = document.querySelector('#drawModal')
  const drawModal = new bootstrap.Modal(drawModalDom)
  const drawModalClose = document.querySelectorAll('.drawModalClose')
  const drawModalUnderstood = document.querySelector('.drawModalUnderstood')


  let points = []
  let getBounding_flag = false
  let wipe_flag = false
  let scrawl_flag = false



  // 描边时点和标准线的显示
  box.addEventListener('mousemove', e => {
    if (!getBounding_flag) return
    mouseArrow.style.display = 'block'
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.x
    const y = e.clientY - rect.y
    mouseArrow.style.left = x - 4 + 'px'
    mouseArrow.style.top = y - 4 + 'px'
    //两条虚线
    line.style.top = y + 'px'
    Vertical.style.left = x + 'px'
  })
  box.addEventListener('mouseenter', e => {
    // console.log('mouseenter');
    if (!getBounding_flag) return
    mouseArrow.style.display = 'block'
    line.style.display = 'block'
    Vertical.style.display = 'block'
  })
  box.addEventListener('mouseleave', e => {
    // console.log('mouseleave');
    if (!getBounding_flag) return
    mouseArrow.style.display = 'none'
    line.style.display = 'none'
    Vertical.style.display = 'none'
  })


  // 描边
  box.addEventListener('click', e => {
    if (getBounding_flag === true) {
      draw(e)
    }
  })
  function draw(e) {
    // console.log(e.clientX, e.clientY);
    const rect = canvas.getBoundingClientRect()
    // console.log(rect);
    const x = e.clientX - rect.x
    const y = e.clientY - rect.y
    // console.log(x, y);
    points.push({ x: x, y: y })
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    getBounding(ctx)
  }


  drawModalClose.forEach(item => {
    item.addEventListener('click', () => {
      getBounding_flag = false
    })
  })
  // 开始描边按钮点击事件
  drawBtn.addEventListener('click', function () {
    drawModal.show()
    drawModalUnderstood.addEventListener('click', () => {
      // console.log(0);
      drawModal.hide()
      points = []
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      getBounding_flag = true
      scrawl_flag = false
      wipe_flag = false
    })
  })



  // 红黑图片的黑色背景设置 
  function getResImg() {
    // 获得黑色背景
    ctx2.beginPath()
    ctx2.rect(0, 0, rbImgCanvas.width, rbImgCanvas.height)
    ctx2.fill()
    ctx2.closePath()
  }
  getResImg()

  // content === ctx2 是为了处理生成红黑图片
  function getBounding(content) {
    content.beginPath()
    points[0] && content.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      content.lineTo(points[i].x, points[i].y)
    }
    points[0] && content.lineTo(points[0].x, points[0].y)

    if (content === ctx2) {
      content.strokeStyle = 'red'
    }
    else {
      content.strokeStyle = 'rgba(232, 177, 164,.6)'
    }
    content.lineWidth = 2
    content.stroke()
    if (content === ctx2) {
      content.fillStyle = 'red'
      content.fill()
    } else if (content === ctx) {
      content.fillStyle = 'rgba(232, 177, 164,.6)'
      content.fill()
    }
    content.closePath()
  }



  //  橡皮擦功能 
  wipeBtn.addEventListener('click', () => {
    getBounding_flag = false
    wipe_flag = true
    scrawl_flag = false
    wipe()
  })
  let downFlag = false
  function wipe() {
    box.onmousedown = null
    box.onmousedown = function (e) {
      if (!wipe_flag) return
      // console.log('down');
      downFlag = true
      let radius = 3

      window.onmousemove = null
      window.onmousemove = function (e) {
        if (downFlag) {
          let ev = e || window.event
          const rect = canvas.getBoundingClientRect()
          const x = ev.clientX - rect.x
          const y = ev.clientY - rect.y
          // console.log(x, y)
          ctx.save()
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.clip()
          ctx.clearRect(x - radius, y - radius, radius * 2, radius * 2)
          ctx.restore()
        }
      }
      box.onmouseup = null
      box.onmouseup = function () {
        // console.log('up');
        window.onmousemove = null
        downFlag = false
      }
    }
  }


  //  涂鸦功能 
  scrawlBtn.addEventListener('click', () => {
    wipe_flag = false
    getBounding_flag = false
    scrawl_flag = true
    scrawl()
  })
  function scrawl() {
    box.onmousedown = null
    box.onmousedown = function (e) {
      if (!scrawl_flag) return
      // console.log('down');
      downFlag = true
      let ev = e || window.event
      const rect = canvas.getBoundingClientRect()
      const x = ev.clientX - rect.x
      const y = ev.clientY - rect.y
      // ctx.beginPath()
      // ctx.moveTo(x, y)
      // ctx.strokeStyle = 'rgba(232, 177, 164,.1)'
      // ctx.strokeStyle = 'rgba(232, 177, 164,.6)'
      // ctx.lineWidth = 2
      // ctx.lineCap = 'round'
      const radius = 4
      window.onmousemove = null
      window.onmousemove = function (e) {
        if (downFlag) {
          let ev = e || window.event
          const rect = canvas.getBoundingClientRect()
          const x = ev.clientX - rect.x
          const y = ev.clientY - rect.y
          // ctx.lineTo(x, y)
          // ctx.stroke()
          ctx.save()
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.clip()
          ctx.clearRect(x - radius, y - radius, radius * 2, radius * 2)
          ctx.fillStyle = 'rgba(232, 177, 164,.6)'
          ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
          ctx.restore()
        }
      }
      box.onmouseup = null
      box.onmouseup = function () {
        // console.log('up');
        downFlag = false
        window.onmousemove = null
      }
    }
  }


  // copy获得mask
  copyBtn.addEventListener('click', () => {
    // console.log(ctx.getImageData(0, 0, canvas.width, canvas.height));


    const naturalWidth = document.querySelector('.workImg img').naturalWidth
    const naturalHeight = document.querySelector('.workImg img').naturalHeight
    rbImgCanvas.width = naturalWidth
    rbImgCanvas.height = naturalHeight
    ctx2 = rbImgCanvas.getContext('2d')

    copy(ctx, ctx2, naturalWidth, naturalHeight)

    getBounding_flag = false
    wipe_flag = false
    scrawl_flag = false

    // 解析路径来获取图片名字和文件夹名字
    const path = document.querySelector('.workImg img').src
    // console.log(path);
    const dirname = decodeURIComponent(path.split('/')[path.split('/').length - 3])
    const filename = path.split('/')[path.split('/').length - 1]

    // 生成mask后发给服务器
    rbImgCanvas.toBlob(blob => {
      const file = new File([blob], 'mask.png', { type: 'image/png' })
      const fd = new FormData()
      fd.append('files', file)
      fd.append('dirname', dirname)
      fd.append('filename', filename)
      // console.log(dirname, filename);
      axios({
        method: 'post',
        url: '/mask_file',
        data: fd
      }).then(res => {
        console.log(res);
      }).catch(err => {
        console.log(err);
      })
    }, 'image/png')

    // rbImgCanvas.width = canvas.width
    // rbImgCanvas.height = canvas.height
  })

  function copy(ctx, ctx2, width, height) {
    const imgData = ctx.getImageData(0, 0, width, height)
    // console.log(imgData);
    for (let i = 0; i < imgData.data.length; i += 4) {
      if (imgData.data[i] > 20
        && imgData.data[i + 1] > 20
        && imgData.data[i + 2] > 20) {
        imgData.data[i] = 255
        imgData.data[i + 1] = 0
        imgData.data[i + 2] = 0
        imgData.data[i + 3] = 255
      }
      else {
        imgData.data[i] = 0
        imgData.data[i + 1] = 0
        imgData.data[i + 2] = 0
        imgData.data[i + 3] = 255
      }
    }
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    tempCtx = tempCanvas.getContext('2d')
    tempCtx.putImageData(imgData, 0, 0)

    // 等比例缩放
    ctx2.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, width, height)
  }

}());


// 自动标注图像处理
(function () {
  /**
   * 新键一个tempCanvas
   * 将mark加载到tempCanvas上
   * 用getImagedata获得mark的数据
   * 将数据渲染到目标canvans上
   */
  function autoMark() {
    const tempCanvas = document.createElement('canvas')
    // console.log(tempCanvas);
    tempCanvas.width = 400
    tempCanvas.height = 400
    const tempCtx = tempCanvas.getContext('2d')

    const canvas = document.querySelector('.drawingCanvas')
    // console.log(canvas);
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.src = '../image/mark.png'
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
  }
  // autoMark()


  // const autoModeBtn = document.querySelector('.autoMode')
  // autoModeBtn.addEventListener('click', autoMark)
}());

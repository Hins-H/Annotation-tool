# coding:utf-8
 
from flask import Flask, request
import os
import sys 
app = Flask(__name__)
AUTO_MODE = False

sys.path.append("/home/hzx/persam_backend/model/Personalize-SAM")
# import persam_f_multi_obj

# 上传原文件
@app.route('/api/raw_file', methods=['POST'])
def upload_raw_file():
    files = request.files.getlist('files')
    dirname = request.form.get('dirname')
    filename = request.form.get('filename')
    print(files)
    basepath = os.path.dirname(__file__)
    for file in files:
        # 检查路径，如果文件夹不存在，就返回无文件夹的错误
        if not os.path.exists(os.path.join(basepath, f'model/Personalize-SAM/data/{dirname}/raw')):
            return {'status': 'no such dir'}, 404

        upload_path = os.path.join(basepath, f'model/Personalize-SAM/data/{dirname}/raw', filename)
        file.save(upload_path)

    # 返回 201
    return {'status': 'success'}, 201

# 上传 mask 文件
@app.route('/api/mask_file', methods=['POST'])
def upload_mask_file():
    files = request.files.getlist('files')
    dirname = request.form.get('dirname')
    filename = request.form.get('filename')
    print(files)
    basepath = os.path.dirname(__file__)
    for file in files:
        # 检查路径，如果文件夹不存在，就返回无文件夹的错误
        if not os.path.exists(os.path.join(basepath, f'model/Personalize-SAM/data/{dirname}/mask')):
            return {'status': 'no such dir'}, 404

        upload_path = os.path.join(basepath, f'model/Personalize-SAM/data/{dirname}/mask', filename)
        file.save(upload_path)

    # 返回 201
    return {'status': 'success'}, 201

# 创建文件夹
@app.route('/api/dir/<dirname>', methods=['POST'])
def make_dir(dirname):
    basepath = os.path.dirname(__file__)
    # 检查路径，如果文件夹不存在，就创建文件夹
    os.makedirs(os.path.join(basepath, f'model/Personalize-SAM/data/{dirname}/raw'), exist_ok=True)
    os.makedirs(os.path.join(basepath, f'model/Personalize-SAM/data/{dirname}/mask'), exist_ok=True)
    os.makedirs(os.path.join(basepath, f'model/Personalize-SAM/data/{dirname}/json'), exist_ok=True)
    os.makedirs(os.path.join(basepath, f'model/Personalize-SAM/data/{dirname}/weight'), exist_ok=True)

    # 返回 201
    return {'status': 'success'}, 201

# 对于未标注的图片，返回原图；对于已标注的图片，返回原图和mask图
@app.route('/api/dir/<dirname>/file/<filename>', methods=['GET'])
def download(dirname, filename):
    print('downloading ...')
    basepath = os.path.dirname(__file__)
    base_root = os.path.join(basepath, f'model/Personalize-SAM/data/{dirname}')

    if not os.path.exists(base_root):
        return {'status': 'no such dir'}, 404

    raw_root = os.path.join(base_root, 'raw')
    mask_root = os.path.join(base_root, 'mask')

    if not os.path.exists(os.path.join(raw_root, filename)):
        return {'status': 'no such file'}, 404

    if os.path.exists(os.path.join(mask_root, filename)):
        return {
            'raw': f"http://120.26.140.131/data/{dirname}/raw/{filename}",
            'mask': f"http://120.26.140.131/data/{dirname}/mask/{filename}"
        }, 200
    else:
        return {
            'raw': f"http://120.26.140.131/data/{dirname}/raw/{filename}",
        }, 200
        
# 列出文件夹下的文件
@app.route('/api/dir/<dirname>', methods=['GET'])
def list_files(dirname):
    basepath = os.path.dirname(__file__)
    root = os.path.join(basepath, f'model/Personalize-SAM/data/{dirname}/raw')
    files_list = os.listdir(root)
    return {'files': files_list}, 200

# 获取所有的文件夹
@app.route('/api/dir', methods=['GET'])
def list_dirs():
    basepath = os.path.dirname(__file__)
    root = os.path.join(basepath, f'model/Personalize-SAM/data')
    dirs = os.listdir(root)
    return {'dirs': dirs}, 200

# 设置成自动标注模式
@app.route('/api/auto', methods=['PUT'])
def set_auto_mode():
    global AUTO_MODE

    if AUTO_MODE:
        return {'mode': 'auto'}, 200

    AUTO_MODE = True

    # TODO: 调用自动标注的函数
    # persam_f_multi_obj.main()
    return {'mode': 'auto'}, 200

# 设置成手动标注模式
@app.route('/api/manual', methods=['PUT'])
def set_unauto_mode():
    global AUTO_MODE
    
    AUTO_MODE = False
    return {'mode': 'manual'}, 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=4000, debug=True)

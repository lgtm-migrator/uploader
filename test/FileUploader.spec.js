import FileUploader from '@/FileUploader.vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import sinon from 'sinon'

let mocks = {
  $http: {
    post: sinon.stub().resolves({data: {success: true}})
  },
  $validator: {
    validateAll: sinon.stub().resolves({})
  },
  errors: {
    has: sinon.stub().returns(false),
    first: sinon.stub().returns('Error'),
    clear: sinon.stub().returns(true)
  }
}

describe('FileUploader.vue', () => {
  it('Has props and data', () => {
    const data = FileUploader.data()
    expect(data).to.be.an('object').that.has.all.keys(
      'uploading',
      'files',
      'isValid',
      'oldimage',
      'previewImage',
      'placeholderName'
    )
  })

  it('Throws exception if Axios is not present', () => {
    let log = sinon.stub(console, 'log')
    let error = sinon.stub(console, 'error')
    let localVue = createLocalVue()

    try {
      let uploader = shallowMount(FileUploader, {
        attachToDocument: true,
        localVue,
        mocks: {
          $validator: {
            validateAll: sinon.stub().resolves({})
          },
          errors: {
            has: sinon.stub().returns(false),
            first: sinon.stub().returns('Error'),
            clear: sinon.stub().returns(true)
          }
        },
        propsData: {
          name: 'Document Title',
          url: 'https://example.com/api/post/image'
        }
      })
    } catch (e) {
      console.log(e)
      expect(e.toString()).to.equal('Error: Vue Axios is required on `this.$http`')
      log.restore()
      error.restore()
    }
  })

  it('Throws exception if Vee Validate is not present', () => {
    let log = sinon.stub(console, 'log')
    let error = sinon.stub(console, 'error')
    let localVue = createLocalVue()

    try {
      let uploader = shallowMount(FileUploader, {
        attachToDocument: true,
        localVue,
        mocks: {
          $http: {
            post: sinon.stub().resolves({data: {success: true}})
          },
          errors: {
            has: sinon.stub().returns(false),
            first: sinon.stub().returns('Error'),
            clear: sinon.stub().returns(true)
          }
        },
        propsData: {
          name: 'Document Title',
          url: 'https://example.com/api/post/image'
        }
      })
    } catch (e) {
      console.log(e)
      expect(e.toString()).to.equal('Error: Vee Validate is required on `this.$validate`')
      log.restore()
      error.restore()
    }
  })

  it('Has methods and watchers', () => {
    expect(FileUploader.methods).to.have.all.keys(
      'pickFile',
      'onChange',
      'readFile',
      'reset',
      'uploadFile',
      'doUpload'
    )

    expect(FileUploader.watch).to.have.all.keys(
      'files',
      'previewImage'
    )
  })

  it('Computes placeholder URL correctly', () => {
    let localVue = createLocalVue()
    localVue.directive('validate', sinon.stub().returns(true))
    let uploader = shallowMount(FileUploader, {
      localVue,
      mocks,
      propsData: {
        name: 'Document Title',
        url: 'https://example.com/api/post/image'
      }
    })

    expect(uploader.vm.placeholderUrl).to.equal(false)
    uploader.setProps({
      placeholder: 'some/fake/image.png'
    })
    expect(uploader.vm.placeholderUrl).to.equal('url(some/fake/image.png)')
    uploader.setProps({
      placeholder: 'some/fake/file.pdf'
    })
    expect(uploader.vm.placeholderUrl).to.equal(false)
    expect(uploader.vm.placeholderName).to.equal('file.pdf')
  })

  it('Uses passed in validation rules', () => {
    let localVue = createLocalVue()
    localVue.directive('validate', sinon.stub().returns(true))
    let uploader = shallowMount(FileUploader, {
      localVue,
      mocks,
      propsData: {
        name: 'Document Title',
        url: 'https://example.com/api/post/image',
        validation: {
          rules: {
            x: 'y'
          }
        }
      }
    })

    expect(uploader.vm.rules.x).to.equal('y')
  })

  it('Invokes pickFile when button is clicked', () => {
    let localVue = createLocalVue()
    localVue.directive('validate', sinon.stub().returns(true))
    let uploader = shallowMount(FileUploader, {
      localVue,
      mocks,
      propsData: {
        name: 'Document Title',
        url: 'https://example.com/api/post/image'
      }
    })

    let pickFile = sinon.spy(uploader.vm, 'pickFile')
    uploader.find('button.picker').trigger('click')
    expect(pickFile.called).to.equal(true)
  })

  it('Previews when new file is picked', () => {
    let localVue = createLocalVue()
    localVue.directive('validate', sinon.stub().returns(true))

    let uploader = shallowMount(FileUploader, {
      localVue,
      mocks,
      propsData: {
        name: 'Document Title',
        url: 'https://example.com/api/post/image'
      }
    })
    let preview = sinon.stub(uploader.vm, 'readFile').returns(true)
    let file = new Blob(['content'], {type: 'image/png'})
    file.name = 'file.png'
    let event = {
      target: {
        files: {file}
      }
    }
    return uploader.vm.onChange(event).then(() => {
      uploader.vm.$nextTick(() => {
        expect(preview.called).to.equal(true)
      })
    })
  })

  it('Resets when no file is picked', () => {
    let localVue = createLocalVue()
    localVue.directive('validate', sinon.stub().returns(true))

    let uploader = shallowMount(FileUploader, {
      localVue,
      mocks,
      propsData: {
        name: 'Document Title',
        url: 'https://example.com/api/post/image'
      }
    })
    let event = {
      target: {
        files: []
      }
    }
    return uploader.vm.onChange(event).then(() => {
      expect(uploader.find('div.placeholder').exists()).to.equal(true)
    })
  })

  it('Resets when reset button is clicked', () => {
    let localVue = createLocalVue()
    localVue.directive('validate', sinon.stub().returns(true))

    let uploader = shallowMount(FileUploader, {
      localVue,
      mocks,
      propsData: {
        name: 'Document Title',
        url: 'https://example.com/api/post/image'
      }
    })
    let file = new Blob(['foobar'], {type: 'image/png'})
    file.name = 'file.png'
    uploader.setData({files: [file]})
    expect(uploader.vm.hasFile).to.equal(true)
    let reset = sinon.spy(uploader.vm, 'reset')
    uploader.find('a.reset-button').trigger('click')
    expect(reset.called).to.equal(true)
    expect(uploader.vm.hasFile).to.equal(false)
  })

  it('Previews file if its an image', (done) => {
    let localVue = createLocalVue()
    localVue.directive('validate', sinon.stub().returns(true))

    let uploader = shallowMount(FileUploader, {
      localVue,
      mocks,
      propsData: {
        name: 'Document Title',
        url: 'https://example.com/api/post/image'
      }
    })

    let file = new Blob(['foobar'], {type: 'image/png'})
    file.name = 'file.png'
    uploader.setData({files: [file]})
    const reader = new window.FileReader()
    reader.addEventListener('load', () => {
      expect(uploader.vm.previewImage).to.equal(reader.result)
      done()
    })
    reader.readAsDataURL(file)
  })

  it('Previews file name if its not an image', () => {
    let localVue = createLocalVue()
    localVue.directive('validate', sinon.stub().returns(true))

    let uploader = shallowMount(FileUploader, {
      localVue,
      mocks,
      propsData: {
        name: 'Document Title',
        url: 'https://example.com/api/post/image'
      }
    })
    let file = new Blob(['foobar'], {type: 'application/pdf'})
    file.name = 'test.pdf'
    uploader.setData({files: [file]})
    expect(uploader.vm.previewName).to.equal('test.pdf')
    expect(uploader.vm.previewImage).to.equal('')
  })

  it('Emits input event', () => {
    let localVue = createLocalVue()
    localVue.directive('validate', sinon.stub().returns(true))

    let uploader = shallowMount(FileUploader, {
      localVue,
      mocks,
      propsData: {
        name: 'Document Title',
        url: 'https://example.com/api/post/image'
      }
    })
    let file = new Blob(['foobar'], {type: 'application/pdf'})
    file.name = 'test.pdf'
    uploader.setData({files: [file]})
    expect(uploader.emitted()).to.have.keys('input')
  })

  it('Does not upload when file is invalid', () => {
    let localVue = createLocalVue()
    localVue.directive('validate', sinon.stub().returns(true))

    let uploader = shallowMount(FileUploader, {
      localVue,
      mocks: {
        $http: {
          post: sinon.stub().resolves({data: {success: true}})
        },
        $validator: {
          validateAll: sinon.stub().resolves(false)
        },
        errors: {
          has: sinon.stub().returns(false),
          first: sinon.stub().returns('Error')
        }
      },
      propsData: {
        name: 'Document Title',
        url: 'https://example.com/api/post/image'
      }
    })

    let upload = sinon.stub(uploader.vm, 'doUpload').resolves(true)

    return uploader.vm.uploadFile().then(() => {
      expect(upload.called).to.equal(false)
    }).then(() => {
      uploader.vm.$validator.validateAll.resolves(true)
      return uploader.vm.uploadFile()
    }).then(() => {
      expect(upload.called).to.equal(true)
    })
  })

  it('Uploads file when valid', async () => {
    let localVue = createLocalVue()
    localVue.directive('validate', sinon.stub().returns(true))

    let uploader = shallowMount(FileUploader, {
      localVue,
      mocks: {
        $http: {
          post: sinon.stub().resolves({data: {success: true}})
        },
        $validator: {
          validateAll: sinon.stub().resolves({})
        },
        errors: {
          has: sinon.stub().returns(false),
          first: sinon.stub().returns('Error'),
          clear: sinon.stub().returns(true)
        }
      },
      propsData: {
        name: 'Document Title',
        url: 'https://example.com/api/post/image'
      }
    })

    let file = new Blob(['foobar'], {type: 'application/pdf'})
    file.name = 'test.pdf'

    uploader.setData({files: [file]})

    let reset = sinon.stub(uploader.vm, 'reset').returns(true)

    await uploader.vm.doUpload()
      .then((response) => {
        expect(response.data.success).equal(true)
        expect(uploader.emitted()).to.have.all.keys('input', 'uploaded', 'progress')
        expect(reset.called).to.equal(true)
      })
  })

  it('Handles upload error', () => {
    let localVue = createLocalVue()
    localVue.directive('validate', sinon.stub().returns(true))

    let uploader = shallowMount(FileUploader, {
      localVue,
      mocks,
      propsData: {
        name: 'Document Title',
        url: 'https://example.com/api/post/image'
      }
    })
    let file = new Blob(['foobar'], {type: 'application/pdf'})
    file.name = 'test.pdf'
    uploader.setData({files: [file]})
    let reset = sinon.stub(uploader.vm, 'reset').returns(true)
    uploader.vm.$http.post.rejects({response: {success: false}})
    return uploader.vm.doUpload()
      .then(({response}) => {
        expect(response.success).equal(false)
        expect(uploader.emitted()).to.have.all.keys('input', 'failed', 'progress')
        expect(reset.called).to.equal(true)
      })
  })
})

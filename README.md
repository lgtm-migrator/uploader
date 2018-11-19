# vue-uploader

#### Simple File Uploader

Basic file uploader

## Install

```
npm install vue-uploader --save
```

## Test and Build

```
npm run test
npm run build
```

## Usage

```
import FileUploader from 'vue-uploader'
```

Include it in the component you'd like to use it in.

### Basic

Will generate a basic uploader

```vue
<file-uploader
  name="image"
  v-model="imageModel"
  :placeholder="photo ? photo.url : ''"
  v-validate="{required: true, mimes: ['image/png'], size: 10240, min_width: 2500, min_height: 1500}">
</file-uploader>
```

### Advanced

You can further customise the uploader, and include custom image
assets.

```vue
<file-uploader
  @progress="updateProgress"
  @uploaded="uploadDocument"
  @failed="handleFailure"
  url="https://example.com/post"
  name="Filename"
  :validation="validation"
  :styles="uploaderStyles"
  :reset-image="resetImage"
  :preview="preview"
  v-model="uploadedFile">
</file-uploader>
```

```js
{
  // validation property
  validation: {
    rules: {
      required: true,
      mimes: ['image/png', 'image/jpg', 'image/jpeg'],
      size: 10240
    }
  },

  // styles property
  uploaderStyles: {
    box: {
      width: '130px',
      height: '70px',
      margin: '1em'
    },
    preview: {
      width: '120px',
      height: '60px',
      margin: '1em'
    },
    button: {
      colour: '#101010',
      text: 'white',
      disabled: 'lightgrey',
      width: '120px',
      margin: '1em'
    }
  },

  // custom images
  resetImage: url("data:image/png;base64,XXX"),
  preview: url("data:image/png;base64,ZZZ"),

  // custom events
  updateProgress: (data) => { console.log(data) },
  uploadDocument: () => { console.log('uploaded') },
  handleFailure: () => { throw 'Failed' }
}
```

### Additional Vee Valiate Validations

There are 2 custom Vee Validate directives included in this package.

You can enable them in your host application like this:

```
// main.js
import minimumWidth from '@/validation/minwidth.js'
import minimumHeight from '@/validation/minheight.js'

VeeValidate.Validator.extend('min_width', {
  validate: minimumWidth,
  getMessage: field => 'Image width must be 500px minimum'
})

VeeValidate.Validator.extend('min_height', {
  validate: minimumHeight,
  getMessage: field => 'Image height must be 20px minimum'
})
```

module.exports = {
  props: {
    id: {
      type: String
    },
    sincemonth: {
      type: Number,
      twoWay: true
    },
    sinceyear: {
      type: Number,
      twoWay: true
    },
    untilmonth: {
      type: Number,
      twoWay: true
    },
    untilyear: {
      type: Number,
      twoWay: true
    },
    iscurrent: {
      type: Boolean,
      twoWay: true,
      default: true
    },

    description: {
      type: String,
      twoWay: true
    },
    tags: {
      type: Array
    },
    error: {

    }
  }
}

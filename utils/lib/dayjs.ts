import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration'

dayjs.extend(customParseFormat)
dayjs.extend(duration)

export { Dayjs }
export default dayjs

import {Page} from 'roam-api-wrappers/dist/data'

export const configPageName = 'roam/js/matrix-rx'
export const createConfigPage = async (name = configPageName) => {
    return Page.getOrCreate(name)
}

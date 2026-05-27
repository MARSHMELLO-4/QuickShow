export const dateFormat = (date : string) => {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month : 'long',
        day : 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    })
}
import {X, Trash2} from 'lucide-react'

export const EventDetailsPopover = 
({
    event,
    position,
    onClose,
    onDelete
}) => {

    return (
        <>
        
        <div 
            className='fixed inset-0 bg-black/20 z-40' 
            onClick={onClose}
        />

        <div 
            className='fixed bg-white rounded-lg shadow-2xl z-100'
            style={{
                top: position.y,
                left: position.x,
                width: '400px',
                maxHeight: '600px'
            }}

        >
            <div
                className='absolute left-0 top-0 bottom-0 w-1 rounded'
                style={{backgroundColor:event.colorHex}}
            />

            <div className='pl-6 pr-4 py-4'>      

                {/* Action Buttons */}
                <div className='absolute top-3 right-3 flex gap-1'>
                    <button onClick={onDelete} title='Delete'>
                        <Trash2 size={20}/> 
                    </button>
                    <button onClick={onClose} title='Close'>
                        <X size={20}/>
                    </button>
                </div>

            <h1 className='text-2xl font-normal mb-2 pr-16'>
                {event.title}
            </h1>       

            <div className='text-sm text-gray-700 mb-6'>
                 {event.date} ⋅ {event.startTime} - {event.endTime}
            </div>   

        
            </div>
        </div>

        </>
    )

}

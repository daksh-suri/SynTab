import React from 'react'

const SearchBar = ({value,onChange}) => {
  return (
    <div className="search-bar">
        <input
            type='search'
            placeholder='Search tabs by title or URL'
            onChange={(ev)=> onChange(ev.target.value)} 
        />
    </div>
  )
}
export default SearchBar
import React, { useEffect, useRef, useState } from 'react'
import { DataTable, type DataTableSelectionMultipleChangeEvent } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { artworkService } from './services/artworkService'
import type { Artwork } from './types/artwork'

interface SelectionState {
  selectedRows: Set<number>
  deselectedRows: Set<number>
  autoSelectedRows: Set<number>
  targetCount: number
}

const ROWS_PER_PAGE = 12

const App: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [first, setFirst] = useState<number>(0)
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [showSelectionPanel, setShowSelectionPanel] = useState<boolean>(false)
  const [selectionInput, setSelectionInput] = useState<string>('')

  const selectionState = useRef<SelectionState>({
    selectedRows: new Set<number>(),
    deselectedRows: new Set<number>(),
    autoSelectedRows: new Set<number>(),
    targetCount: 0
  })

  const currentPage = Math.floor(first / ROWS_PER_PAGE) + 1

  const loadArtworks = async (page: number) => {
    setLoading(true)
    try {
      const res = await artworkService.getArtworks(page, ROWS_PER_PAGE)
      setArtworks(res.artworks)
      setTotalRecords(res.pagination.total)
      performAutoSelectionOnPage(res.artworks)
      updateCurrentPageSelection(res.artworks)
    } catch (err) {
      console.error('Error loading artworks', err)
    } finally {
      setLoading(false)
    }
  }

  const updateCurrentPageSelection = (currentArtworks: Artwork[]) => {
    const selected = currentArtworks.filter(
      a => selectionState.current.selectedRows.has(a.id) && !selectionState.current.deselectedRows.has(a.id)
    )
    setSelectedArtworks(selected)
  }

  const performAutoSelectionOnPage = (currentArtworks: Artwork[]) => {
    const st = selectionState.current
    if (st.targetCount <= 0) return
    if (st.selectedRows.size >= st.targetCount) return

    for (const art of currentArtworks) {
      if (st.selectedRows.size >= st.targetCount) break
      const id = art.id
      if (st.selectedRows.has(id) || st.deselectedRows.has(id)) continue
      st.selectedRows.add(id)
      st.autoSelectedRows.add(id)
    }
  }

  const onPageChange = (event: any) => {
    setFirst(event.first)
    const newPage = Math.floor(event.first / ROWS_PER_PAGE) + 1
    loadArtworks(newPage)
  }

  const onSelectionChange = (e: DataTableSelectionMultipleChangeEvent<Artwork[]>) => {
    const newSelection = (e.value as Artwork[]) || []
    setSelectedArtworks(newSelection)

    const newSelectionIds = new Set(newSelection.map(a => a.id))
    const currentPageIds = artworks.map(a => a.id)
    const st = selectionState.current

    currentPageIds.forEach(id => {
      const wasSelectedGlobally = st.selectedRows.has(id)
      const isNowSelected = newSelectionIds.has(id)

      if (!wasSelectedGlobally && isNowSelected) {
        st.selectedRows.add(id)
        st.deselectedRows.delete(id)
        st.autoSelectedRows.delete(id)
      } else if (wasSelectedGlobally && !isNowSelected) {
        st.selectedRows.delete(id)
        st.autoSelectedRows.delete(id)
        st.deselectedRows.add(id)
      }
    })

    const target = st.targetCount
    if (target > 0 && st.selectedRows.size > target) {
      const autoIter = st.autoSelectedRows.values()
      while (st.selectedRows.size > target) {
        const val = autoIter.next()
        if (val.done) break
        const idToRemove = val.value
        if (st.selectedRows.has(idToRemove)) {
          st.selectedRows.delete(idToRemove)
          st.autoSelectedRows.delete(idToRemove)
        }
      }
      updateCurrentPageSelection(artworks)
    }
  }

  const handleCustomSelectionSubmit = () => {
    const n = parseInt(selectionInput.trim(), 10)
    if (isNaN(n) || n <= 0) return

    const st = selectionState.current
    st.targetCount = n

    if (st.selectedRows.size > n) {
      const autoIds = Array.from(st.autoSelectedRows)
      for (const id of autoIds) {
        if (st.selectedRows.size <= n) break
        st.selectedRows.delete(id)
        st.autoSelectedRows.delete(id)
      }
    }

    performAutoSelectionOnPage(artworks)
    updateCurrentPageSelection(artworks)

    setSelectionInput('')
    setShowSelectionPanel(false)
  }

  const getTotalSelectedCount = () => selectionState.current.selectedRows.size

  const clearAllSelections = () => {
    const st = selectionState.current
    st.selectedRows.clear()
    st.deselectedRows.clear()
    st.autoSelectedRows.clear()
    st.targetCount = 0
    setSelectedArtworks([])
  }

  useEffect(() => {
    loadArtworks(1)
  }, [])

  const titleBodyTemplate = (rowData: Artwork) => <span title={rowData.title ?? 'Untitled'}>{rowData.title ?? 'Untitled'}</span>
  const artistBodyTemplate = (rowData: Artwork) => <span title={rowData.artist_display ?? 'Unknown Artist'}>{rowData.artist_display ?? 'Unknown Artist'}</span>
  const originBodyTemplate = (rowData: Artwork) => <span>{rowData.place_of_origin ?? 'Unknown'}</span>
  const dateBodyTemplate = (rowData: Artwork) => {
    if (rowData.date_start && rowData.date_end) return `${rowData.date_start} - ${rowData.date_end}`
    if (rowData.date_start) return `${rowData.date_start}`
    return 'Unknown'
  }

  return (
    <div className="app-container">
      <div className="table-header">
        <h1>Art Institute of Chicago - Artworks Collection</h1>
        <p>Browse and select artworks from the collection</p>

        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button label="Select Rows (count)" icon="pi pi-plus" onClick={() => setShowSelectionPanel(true)} size="small" />
          <Button label="Clear All" icon="pi pi-times" onClick={clearAllSelections} severity="secondary" size="small" />
          <span className="selection-info">Selected: {getTotalSelectedCount()} items across all pages</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          Current page: {currentPage}
        </div>
      </div>

      <div className={`table-container ${loading ? 'loading-overlay' : ''}`}>
        <DataTable
          value={artworks}
          selection={selectedArtworks}
          onSelectionChange={onSelectionChange}
          selectionMode="multiple"
          dataKey="id"
          loading={loading}
          className="custom-datatable"
          size="small"
          stripedRows
          showGridlines
          lazy
          paginator
          rows={ROWS_PER_PAGE}
          totalRecords={totalRecords}
          first={first}
          onPage={onPageChange}
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
          <Column field="id" header="Code" style={{ width: '120px' }} />
          <Column field="title" header="Name" body={titleBodyTemplate} style={{ minWidth: '200px' }} />
          <Column field="artist_display" header="Artist" body={artistBodyTemplate} style={{ minWidth: '150px' }} />
          <Column field="place_of_origin" header="Origin" body={originBodyTemplate} style={{ width: '120px' }} />
          <Column field="date" header="Date" body={dateBodyTemplate} style={{ width: '120px' }} />
          <Column field="inscriptions" header="Inscriptions" style={{ minWidth: '150px' }} />
        </DataTable>
      </div>

      {showSelectionPanel && (
        <div className="selection-overlay" onClick={() => setShowSelectionPanel(false)}>
          <div className="selection-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Select Rows by Count</h3>
            <InputText
              value={selectionInput}
              onChange={(e) => setSelectionInput(e.target.value)}
              placeholder="Enter total count (e.g., 20)"
              className="selection-input"
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSelectionSubmit()}
            />
            <div className="selection-buttons">
              <Button label="Submit" onClick={handleCustomSelectionSubmit} className="btn btn-primary" size="small" />
              <Button label="Cancel" onClick={() => { setSelectionInput(''); setShowSelectionPanel(false) }} className="btn btn-secondary" size="small" />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
              Currently selected: {getTotalSelectedCount()}. Target (overlay): {selectionState.current.targetCount || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
